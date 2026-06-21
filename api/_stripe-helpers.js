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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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

// Fetches all reservations for a vehicle via Firestore REST and checks for date overlap.
// Throws with err.code === "AVAILABILITY_ERROR" if conflicting reservation found.
// Returns without throwing if the Firestore query itself fails (don't block checkout on infra errors).
export async function checkVehicleAvailability(vehicleId, startDate, endDate) {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "reservations" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "vehicleId" },
              op: "EQUAL",
              value: { stringValue: vehicleId },
            },
          },
        },
      }),
    });
  } catch (err) {
    const e = new Error("Availability check unreachable");
    e.code = "AVAILABILITY_CHECK_FAILED";
    throw e;
  }

  if (!resp.ok) {
    const e = new Error("Availability check failed");
    e.code = "AVAILABILITY_CHECK_FAILED";
    throw e;
  }

  const results = await resp.json();
  const conflict = results.some((item) => {
    if (!item.document) return false;
    const f = item.document.fields || {};
    const statut = f.statut?.stringValue;
    const rStart = f.startDate?.stringValue;
    const rEnd = f.endDate?.stringValue;
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
