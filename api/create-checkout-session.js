import Stripe from "stripe";
import { fetchVehicle, calcNbJours, checkVehicleAvailability, checkRateLimit, setCors, ALLOWED_ORIGINS } from "./_stripe-helpers.js";

// Instantiated once at module scope to reuse the HTTP connection pool.
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function validateCancelUrl(cancelUrl, allowedOrigins) {
  if (!cancelUrl) return true;
  try {
    const cancelOrigin = new URL(cancelUrl).origin;
    const devMode = allowedOrigins.length === 0;
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(cancelOrigin);
    return devMode ? isLocalhost : allowedOrigins.includes(cancelOrigin);
  } catch {
    return false;
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (checkRateLimit(req, { max: 10, windowMs: 60_000 })) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
  }

  if (!stripe) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY non configurée." });
  }

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

  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate) || endDate < startDate) {
    return res.status(400).json({ error: "Dates invalides" });
  }

  if ((startTime && !TIME_RE.test(startTime)) || (endTime && !TIME_RE.test(endTime))) {
    return res.status(400).json({ error: "Heures invalides" });
  }

  // S1: validate cancelUrl to prevent open redirects via Stripe's cancel flow.
  if (!validateCancelUrl(cancelUrl, ALLOWED_ORIGINS)) {
    return res.status(400).json({ error: "cancelUrl non autorisée" });
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
    if (err.code === "AVAILABILITY_CHECK_FAILED") {
      return res.status(503).json({ error: "Service temporairement indisponible. Réessayez dans quelques instants." });
    }
    throw err;
  }

  const nbJours = calcNbJours(startDate, endDate, startTime, endTime);
  const amount = nbJours * vehicle.prix;
  const vehicleLabel = `${vehicle.marque} ${vehicle.modele}`;

  // S5: build successUrl from the configured origin, not from the request's Origin header
  // which could be forged. Falls back to the request origin in local dev (no ALLOWED_ORIGINS).
  const siteOrigin = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS[0] : (req.headers.origin || "");
  const successUrl = `${siteOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;

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
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Erreur de paiement. Veuillez réessayer." });
  }
}
