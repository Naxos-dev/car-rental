import Stripe from "stripe";
import { upsertReservationFromSession } from "./_stripe-helpers.js";

// Signature verification needs the raw request body, so Vercel's automatic JSON parsing
// must be disabled for this route.
export const config = { api: { bodyParser: false } };

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Webhook non configuré." });
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
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
        // Non-2xx makes Stripe retry the webhook later.
        return res.status(500).json({ error: "Erreur d'enregistrement" });
      }
    }
  }

  res.json({ received: true });
}
