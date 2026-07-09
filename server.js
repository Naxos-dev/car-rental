import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import {
  fetchVehicle,
  calcNbJours,
  calculateAmount,
  checkVehicleAvailability,
  checkRateLimit,
  getVehicleReservedRanges,
  upsertReservationFromSession,
  alertPaymentFailed,
} from "./api/_stripe-helpers.js";
import { sendReservationConfirmationEmail } from "./api/_email-helpers.js";

const app = express();
const PORT = 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function rateLimit({ max, windowMs }) {
  return (req, res, next) => {
    if (checkRateLimit(req, { max, windowMs })) {
      return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
    }
    next();
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({ origin: "http://localhost:5173" }));

// Mounted before express.json() (below) because signature verification needs the raw body.
// For local testing: `stripe listen --forward-to localhost:3001/stripe-webhook`.
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Webhook non configuré." });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).json({ error: "Signature invalide" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      try {
        await upsertReservationFromSession(session);
      } catch (err) {
        console.error("Reservation upsert error:", err);
        return res.status(500).json({ error: "Erreur d'enregistrement" });
      }
    }
  } else if (event.type === "checkout.session.async_payment_failed") {
    await alertPaymentFailed(event.data.object);
  }
  res.json({ received: true });
});

app.use(express.json());

app.post("/create-checkout-session", rateLimit({ max: 10, windowMs: 60_000 }), async (req, res) => {
  const {
    vehicleId,
    startDate,
    endDate,
    nom = "",
    email = "",
    telephone = "",
    location = "",
    startTime = "",
    endTime = "",
    userId = "",
    cancelUrl,
  } = req.body;

  if (!vehicleId || !startDate || !endDate || !cancelUrl) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate) || endDate < startDate) {
    return res.status(400).json({ error: "Dates invalides" });
  }

  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  if ((startTime && !TIME_RE.test(startTime)) || (endTime && !TIME_RE.test(endTime))) {
    return res.status(400).json({ error: "Heures invalides" });
  }

  // S1: reject cancelUrls that don't belong to the frontend origin.
  try {
    if (new URL(cancelUrl).origin !== FRONTEND_URL) {
      return res.status(400).json({ error: "cancelUrl non autorisée" });
    }
  } catch {
    return res.status(400).json({ error: "cancelUrl invalide" });
  }

  let vehicle;
  try {
    vehicle = await fetchVehicle(vehicleId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    await checkVehicleAvailability(vehicleId, startDate, endDate);
  } catch (err) {
    if (err.code === "AVAILABILITY_ERROR") {
      return res.status(409).json({ error: "VEHICLE_UNAVAILABLE" });
    }
  }

  const nbJours = calcNbJours(startDate, endDate, startTime, endTime);
  const amount = calculateAmount(vehicle, startDate, nbJours);
  const vehicleLabel = `${vehicle.marque} ${vehicle.modele}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      metadata: {
        vehicleId,
        vehicleLabel,
        photoURL: vehicle.photoURL ? vehicle.photoURL.substring(0, 500) : "",
        nom,
        email,
        telephone,
        location,
        startDate,
        startTime,
        endDate,
        endTime,
        userId,
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Location — ${vehicleLabel}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Erreur de paiement. Veuillez réessayer." });
  }
});

app.post("/verify-session", rateLimit({ max: 20, windowMs: 60_000 }), async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return res.status(400).json({ error: "sessionId invalide" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Paiement non complété" });
    }
    res.json({ paid: true, metadata: session.metadata });
  } catch (err) {
    console.error("Stripe verify error:", err.message);
    res.status(400).json({ error: "Session Stripe introuvable" });
  }
});

app.get("/vehicle-availability", rateLimit({ max: 60, windowMs: 60_000 }), async (req, res) => {
  // vehicleId is optional: omitted, it returns reserved ranges for every vehicle
  // (used by the fleet list to filter out vehicles booked by other users).
  const vehicleId = req.query.vehicleId;
  if (vehicleId && !/^[\w-]{1,128}$/.test(vehicleId)) {
    return res.status(400).json({ error: "vehicleId invalide" });
  }
  try {
    const ranges = await getVehicleReservedRanges(vehicleId || undefined);
    res.json({ ranges });
  } catch (err) {
    console.error("Vehicle availability error:", err);
    res.status(503).json({ error: "Service temporairement indisponible. Réessayez dans quelques instants." });
  }
});

app.post("/send-reservation-email", rateLimit({ max: 10, windowMs: 60_000 }), async (req, res) => {
  const {
    to, reservationId = "", nom = "", vehicleLabel = "", startDate, startTime = "", endDate, endTime = "", location = "", amount,
  } = req.body;

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Stripe local → http://localhost:${PORT}`);
});
