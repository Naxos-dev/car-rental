import { initializeApp, cert, getApps } from "firebase-admin/app";
import { initializeFirestore } from "firebase-admin/firestore";

// Shared by _stripe-helpers.js (availability/reservation writes) and _email-helpers.js
// (location address lookup) — split out so neither has to import the other, which would
// create a circular dependency (each already imports functions from the other).
//
// Admin SDK credentials bypass Firestore security rules for these trusted server-side reads
// and writes. Lazily initialized so a missing key only breaks the callers that need it.
let _adminDb = null;
export function getAdminDb() {
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
