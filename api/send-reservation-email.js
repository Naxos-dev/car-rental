import { checkRateLimit, setCors } from "./_stripe-helpers.js";
import { sendReservationConfirmationEmail } from "./_email-helpers.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sends the reservation confirmation email for bookings created outside the Stripe checkout
// flow (e.g. BackOffice agency bookings), which have no webhook to trigger it from. Stripe-paid
// bookings get their email from upsertReservationFromSession instead — see api/_stripe-helpers.js.
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (checkRateLimit(req, { max: 10, windowMs: 60_000 })) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
  }

  const {
    to, reservationId = "", nom = "", vehicleLabel = "", startDate, startTime = "", endDate, endTime = "", location = "", amount,
  } = req.body || {};

  if (!to || !EMAIL_RE.test(to) || !vehicleLabel || !startDate || !endDate) {
    return res.status(400).json({ error: "Paramètres manquants ou invalides" });
  }
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    return res.status(400).json({ error: "Dates invalides" });
  }
  if ((startTime && !TIME_RE.test(startTime)) || (endTime && !TIME_RE.test(endTime))) {
    return res.status(400).json({ error: "Heures invalides" });
  }

  await sendReservationConfirmationEmail({
    to, reservationId, nom, vehicleLabel, startDate, startTime, endDate, endTime, location,
    amount: typeof amount === "number" ? amount : undefined,
  });

  res.json({ sent: true });
}
