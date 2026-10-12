import { initializeApp, cert, getApps } from "firebase-admin/app";
import { initializeFirestore } from "firebase-admin/firestore";

// Shared by _stripe-helpers.js (availability/reservation writes) and _email-helpers.js
// (location address lookup) — split out so neither has to import the other, which would
// create a circular dependency (each already imports functions from the other).
//
// Admin SDK credentials bypass Firestore security rules for these trusted server-side reads
// and writes. Lazily initialized so a missing key only breaks the callers that need it.
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY non configurée");
  const serviceAccount = JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
  return initializeApp({ credential: cert(serviceAccount) });
}

let _adminDb = null;
export function getAdminDb() {
  if (_adminDb) return _adminDb;
  // gRPC (the Admin SDK's default transport) can hang or fail to establish in some
  // serverless environments (e.g. Vercel functions). REST avoids that at a small latency cost.
  _adminDb = initializeFirestore(getAdminApp(), { preferRest: true });
  return _adminDb;
}

// Verifies the Firebase ID token sent as "Authorization: Bearer <token>" and checks the
// caller's Firestore role — mirrors isAdmin() in firestore.rules, since there is no custom
// claim for it. Returns the admin's uid, or null if the token is missing/invalid or the
// caller isn't an admin (never throws, so route handlers can just check the return value).
//
// Deliberately does NOT use firebase-admin/auth's verifyIdToken(): that module pulls in
// jwks-rsa -> jose (ESM-only), which crashes every function importing this file with
// ERR_REQUIRE_ESM on Vercel's Node runtime (ditto the preferRest choice above, same root
// cause class). Google's own REST endpoint verifies the token just as well, with no SDK.
export async function requireAdmin(req) {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!match) return null;
  try {
    const apiKey = process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: match[1] }),
    });
    if (!resp.ok) return null;
    const { users } = await resp.json();
    const uid = users?.[0]?.localId;
    if (!uid) return null;
    const snap = await getAdminDb().collection("users").doc(uid).get();
    return snap.exists && snap.data().role === "admin" ? uid : null;
  } catch (err) {
    console.error("[requireAdmin] Token invalide ou vérification échouée:", err.message);
    return null;
  }
}
