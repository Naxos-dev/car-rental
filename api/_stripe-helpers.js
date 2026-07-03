import { initializeApp, cert, getApps } from "firebase-admin/app";
import { initializeFirestore, FieldValue } from "firebase-admin/firestore";

// Comma-separated list of allowed origins, e.g. "https://myapp.com,https://myapp.vercel.app"
// Leave unset in development to allow any origin from localhost.
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

// Reservations require an authenticated Firestore read (see firestore.rules), which the
// REST-with-API-key calls below can't provide. Admin SDK credentials bypass security rules
// for this trusted server-side check. Lazily initialized so a missing key only breaks the
// availability check, not the whole module.
let _adminDb = null;
function getAdminDb() {
  if (_adminDb) return _adminDb;
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY non configurée");
  let app;
  if (!getApps().length) {
    const serviceAccount = JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    app = getApps()[0];
  }
  // gRPC (the Admin SDK's default transport) can hang or fail to establish in some
  // serverless environments (e.g. Vercel functions). REST avoids that at a small latency cost.
  _adminDb = initializeFirestore(app, { preferRest: true });
  return _adminDb;
}

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
  if (!prix) throw new Error("Prix du véhicule introuvable");
  if (!disponible) throw new Error("Véhicule non disponible");
  return { prix, marque, modele, photoURL };
}

export function calcNbJours(startDate, endDate) {
  const diff = new Date(endDate) - new Date(startDate);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
export async function getVehicleReservedRanges(vehicleId) {
  const db = getAdminDb();
  const snapshot = await db.collection("reservations").where("vehicleId", "==", vehicleId).get();
  return snapshot.docs
    .map((doc) => doc.data())
    .filter((f) => f.statut !== "annulee" && f.startDate && f.endDate)
    .map((f) => ({ vehicleId, startDate: f.startDate, endDate: f.endDate, statut: f.statut }));
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
  if ((await ref.get()).exists) return;

  const m = session.metadata || {};
  await ref.set({
    vehicleId: m.vehicleId,
    vehicleLabel: m.vehicleLabel,
    nom: m.nom || "",
    email: m.email || session.customer_email || "",
    telephone: m.telephone || "",
    location: m.location || "",
    startDate: m.startDate,
    startTime: m.startTime || "",
    endDate: m.endDate,
    endTime: m.endTime || "",
    vehiclePhoto: m.photoURL || "",
    userId: m.userId || null,
    stripeSessionId: session.id,
    statut: "confirmee",
    createdAt: FieldValue.serverTimestamp(),
  });
}
