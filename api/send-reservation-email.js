import { checkRateLimit, setCors } from "./_stripe-helpers.js";
import { sendReservationConfirmationEmail } from "./_email-helpers.js";
import { getAdminDb, requireAdmin } from "./_firebase-admin.js";

// Sends the reservation confirmation email for bookings created outside the Stripe checkout
// flow (e.g. BackOffice agency bookings), which have no webhook to trigger it from. Stripe-paid
// bookings get their email from upsertReservationFromSession instead — see api/_stripe-helpers.js.
//
// Admin-only: the only legitimate caller is BackOffice.vue. The recipient and email content are
// read from the reservation document (Admin SDK) rather than trusted from the request body, so
// an authenticated-but-compromised caller can't use this as an arbitrary mail relay.
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (checkRateLimit(req, { max: 10, windowMs: 60_000 })) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
  }

  if (!(await requireAdmin(req))) {
    return res.status(401).json({ error: "Authentification admin requise" });
  }

  const { reservationId } = req.body || {};
  if (!reservationId || typeof reservationId !== "string") {
    return res.status(400).json({ error: "reservationId manquant" });
  }

  const snap = await getAdminDb().collection("reservations").doc(reservationId).get();
  if (!snap.exists) return res.status(404).json({ error: "Réservation introuvable" });

  const r = snap.data();
  if (!r.email) return res.status(400).json({ error: "Réservation sans email" });

  await sendReservationConfirmationEmail({
    to: r.email,
    reservationId,
    nom: r.nom || "",
    vehicleLabel: r.vehicleLabel || "",
    startDate: r.startDate,
    startTime: r.startTime || "",
    endDate: r.endDate,
    endTime: r.endTime || "",
    location: r.location || "",
    amount: typeof r.amount === "number" ? r.amount : undefined,
  });

  res.json({ sent: true });
}
