const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");

const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

exports.createCheckoutSession = onRequest(
  { cors: true, secrets: [stripeSecret] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { amount, vehicleLabel, customerEmail, successUrl, cancelUrl } =
      req.body;

    if (!amount || !vehicleLabel || !successUrl || !cancelUrl) {
      res.status(400).json({ error: "Paramètres manquants" });
      return;
    }

    try {
      const stripe = new Stripe(stripeSecret.value());

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: { name: `Location — ${vehicleLabel}` },
              unit_amount: Math.round(amount * 100), // centimes
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
      res.status(500).json({ error: "Erreur lors de la création du paiement" });
    }
  },
);
