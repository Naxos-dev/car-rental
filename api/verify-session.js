import Stripe from "stripe";
import { checkRateLimit, setCors } from "./_stripe-helpers.js";

// Instantiated once at module scope to reuse the HTTP connection pool.
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (checkRateLimit(req, { max: 20, windowMs: 60_000 })) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
  }

  if (!stripe) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY non configurée." });
  }

  const { sessionId } = req.body;

  // Validate format before hitting Stripe to avoid unnecessary API calls.
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
}
