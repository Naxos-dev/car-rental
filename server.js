import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const { amount, vehicleLabel, customerEmail, successUrl, cancelUrl } =
    req.body;

  if (!amount || !vehicleLabel || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail || undefined,
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
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Stripe local → http://localhost:${PORT}`);
});
