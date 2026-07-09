import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./_firebase-admin.js";
import { sendReservationConfirmationEmail, sendAdminAlertEmail } from "./_email-helpers.js";

// Comma-separated list of allowed origins, e.g. "https://myapp.com,https://myapp.vercel.app"
// Leave unset in development to allow any origin from localhost.
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

export function setCors(req, res) {
  const origin = req.headers.origin || "";
  const devMode = ALLOWED_ORIGINS.length === 0;
  const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
  const allowed = devMode ? isLocalhost : ALLOWED_ORIGINS.includes(origin);
  if (allowed) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Simple in-memory rate limiter. Not distributed — resets on cold start.
// Adequate for Vercel warm instances; use Upstash/Edge Middleware for strict guarantees.
const _rlMap = new Map();

export function checkRateLimit(req, { max, windowMs }) {
  const forwarded = req.headers["x-forwarded-for"];
  // Use the rightmost IP: on Vercel the real client IP is appended last by the CDN.
  // The leftmost entry is attacker-controlled and must never be trusted.
  const ip = (forwarded ? forwarded.split(",").at(-1).trim() : null)
    || req.socket?.remoteAddress
    || "unknown";
  const now = Date.now();
  let entry = _rlMap.get(ip);
  if (!entry || now > entry.resetAt) {
    // Prune stale entries whenever a window resets to bound Map growth.
    if (_rlMap.size > 10_000) {
      for (const [k, v] of _rlMap) { if (now > v.resetAt) _rlMap.delete(k); }
    }
    entry = { count: 0, resetAt: now + windowMs };
  }
  entry.count++;
  _rlMap.set(ip, entry);
  return entry.count > max;
}

// Parse le tableau tarifs (arrayValue de mapValue) au format Firestore REST.
function parseTarifs(f) {
  const values = f.tarifs?.arrayValue?.values || [];
  return values.map((v) => {
    const mf = v.mapValue?.fields || {};
    return {
      debut: mf.debut?.stringValue || "",
      fin: mf.fin?.stringValue || "",
      prix: Number(mf.prix?.integerValue ?? mf.prix?.doubleValue ?? 0),
    };
  });
}

export async function fetchVehicle(vehicleId) {
  // Prevent path traversal in the Firestore REST URL (S2).
  if (!/^[\w-]{1,128}$/.test(vehicleId)) throw new Error("vehicleId invalide");
  // Prefer non-VITE_ names for server-side use; fall back to VITE_ for local dev via .env.local.
  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vehicles/${vehicleId}?key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Véhicule introuvable");
  const data = await resp.json();
  const f = data.fields || {};
  const prix = Number(f.prix?.integerValue ?? f.prix?.doubleValue ?? 0);
  const marque = f.marque?.stringValue || "";
  const modele = f.modele?.stringValue || "";
  const photoURL = f.photoURL?.stringValue || "";
  const disponible = f.disponible?.booleanValue ?? true;
  const tarifs = parseTarifs(f);
  if (!prix) throw new Error("Prix du véhicule introuvable");
  if (!disponible) throw new Error("Véhicule non disponible");
  return { prix, marque, modele, photoURL, tarifs };
}

function addDaysToISODate(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getPriceForDate(vehicle, dateStr) {
  const match = (vehicle.tarifs || []).find(
    (t) => t.debut && t.fin && t.debut <= dateStr && dateStr <= t.fin,
  );
  return match ? match.prix : vehicle.prix;
}

// Mirrors src/utils/pricing.js::calculateTotal — sums the applicable seasonal
// or default price for each billed day. This is the authoritative amount
// charged via Stripe, so it must never trust a client-computed total.
export function calculateAmount(vehicle, startDate, nbJours) {
  let total = 0;
  for (let i = 0; i < nbJours; i++) {
    const dateStr = i === 0 ? startDate : addDaysToISODate(startDate, i);
    total += getPriceForDate(vehicle, dateStr);
  }
  return Math.round(total);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 60 * 60 * 1000;

// Mirrors src/store/checkout.js: any elapsed time over full 24h blocks beyond
// a 60min grace period rolls over into an extra billed day.
export function calcNbJours(startDate, endDate, startTime = "", endTime = "") {
  const start = new Date(`${startDate}T${startTime || "00:00"}`);
  const end = new Date(`${endDate}T${endTime || "00:00"}`);
  const diff = end - start;
  if (diff <= 0) return 1;
  const wholeDays = Math.floor(diff / DAY_MS);
  const remainder = diff - wholeDays * DAY_MS;
  return Math.max(1, wholeDays + (remainder > GRACE_MS ? 1 : 0));
}

// Fetches all reservations for a vehicle via the Admin SDK (bypasses security rules — see
// getAdminDb) and checks for date overlap.
// Throws with err.code === "AVAILABILITY_ERROR" if conflicting reservation found.
// Returns without throwing if the Firestore query itself fails (don't block checkout on infra errors).
export async function checkVehicleAvailability(vehicleId, startDate, endDate) {
  let snapshot;
  try {
    const db = getAdminDb();
    snapshot = await db.collection("reservations").where("vehicleId", "==", vehicleId).get();
  } catch (err) {
    console.error("Availability check error:", err);
    const e = new Error("Availability check unreachable");
    e.code = "AVAILABILITY_CHECK_FAILED";
    throw e;
  }

  const conflict = snapshot.docs.some((doc) => {
    const f = doc.data();
    const statut = f.statut;
    const rStart = f.startDate;
    const rEnd = f.endDate;
    // Treat a reservation with missing dates as always conflicting (corrupted doc).
    if (!rStart || !rEnd) return statut !== "annulee";
    return statut !== "annulee" && rStart <= endDate && rEnd >= startDate;
  });

  if (conflict) {
    const err = new Error("VEHICLE_UNAVAILABLE");
    err.code = "AVAILABILITY_ERROR";
    throw err;
  }
}

// Returns only the fields needed to grey out booked dates in the UI (vehicleId, dates, statut) —
// never the customer's name/email/phone. Called from a public endpoint, so this is the one
// place non-owners are allowed to see that a vehicle is booked for given dates.
// Omitting vehicleId returns ranges for every vehicle (used by the fleet list availability filter).
export async function getVehicleReservedRanges(vehicleId) {
  const db = getAdminDb();
  let q = db.collection("reservations");
  if (vehicleId) q = q.where("vehicleId", "==", vehicleId);
  const snapshot = await q.get();
  return snapshot.docs
    .map((doc) => doc.data())
    .filter((f) => f.statut !== "annulee" && f.startDate && f.endDate && f.vehicleId)
    .map((f) => ({ vehicleId: f.vehicleId, startDate: f.startDate, endDate: f.endDate, statut: f.statut }));
}

// Creates the reservation from a completed Stripe Checkout Session, called from the Stripe
// webhook (see api/stripe-webhook.js). This is the authoritative write: unlike the client-side
// write it replaces, it uses Admin SDK credentials so it isn't subject to the Firestore rule
// restricting reservation reads/writes to their own owner, and Stripe retries the webhook
// automatically if it fails — so a payment is never "lost" the way a client-side write could be.
// Idempotent on session.id (the Firestore doc ID), since Stripe can deliver the same event more
// than once.
export async function upsertReservationFromSession(session) {
  const db = getAdminDb();
  const ref = db.collection("reservations").doc(session.id);
  const m = session.metadata || {};
  const email = m.email || session.customer_email || "";
  const amount = (session.amount_total ?? 0) / 100;

  try {
    if ((await ref.get()).exists) return;
    await ref.set({
      vehicleId: m.vehicleId,
      vehicleLabel: m.vehicleLabel,
      nom: m.nom || "",
      email,
      telephone: m.telephone || "",
      location: m.location || "",
      startDate: m.startDate,
      startTime: m.startTime || "",
      endDate: m.endDate,
      endTime: m.endTime || "",
      vehiclePhoto: m.photoURL || "",
      userId: m.userId || null,
      stripeSessionId: session.id,
      amount,
      statut: "confirmee",
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Money has already been captured by Stripe at this point — a write failure here means a
    // paid booking with no reservation record, which needs a human, not just a retry (Stripe
    // does retry the webhook automatically, but that can take minutes and may not resolve
    // a persistent Firestore issue).
    await sendAdminAlertEmail({
      subject: "Paiement encaissé mais réservation non enregistrée",
      message: `L'écriture Firestore a échoué pour la session Stripe ${session.id} : ${err.message}\n\nVéhicule: ${m.vehicleLabel}\nClient: ${m.nom || "—"} <${email}>\nDates: ${m.startDate} → ${m.endDate}\n\nLe webhook Stripe va réessayer automatiquement, mais vérifiez manuellement si le problème persiste.`,
    });
    throw err;
  }

  await sendReservationConfirmationEmail({
    to: email,
    reservationId: session.id,
    nom: m.nom || "",
    vehicleLabel: m.vehicleLabel,
    startDate: m.startDate,
    startTime: m.startTime || "",
    endDate: m.endDate,
    endTime: m.endTime || "",
    location: m.location || "",
    amount,
  });
}

// Alerts the admin when a Checkout Session's payment ultimately fails. Only fires for delayed
// payment methods (bank transfers, SEPA debit, etc) — this store's card-only checkout normally
// fails synchronously on the Stripe-hosted page (declined card), before a session ever reaches
// the webhook, so today this mostly matters if another payment method is added later. Requires
// the Stripe webhook endpoint (Dashboard → Webhooks) to be subscribed to the
// `checkout.session.async_payment_failed` event, in addition to `checkout.session.completed`.
export async function alertPaymentFailed(session) {
  const m = session.metadata || {};
  const email = m.email || session.customer_email || "";
  await sendAdminAlertEmail({
    subject: "Paiement échoué",
    message: `Le paiement pour la session Stripe ${session.id} a échoué.\n\nVéhicule: ${m.vehicleLabel || "—"}\nClient: ${m.nom || "—"} <${email}>\nDates: ${m.startDate || "—"} → ${m.endDate || "—"}`,
  });
}
