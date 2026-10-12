// Serveur Express de dev local (npm run dev:api) — délègue chaque route aux handlers
// de api/ (déployés sur Vercel en production) pour garantir un comportement identique
// entre local et prod : validation, rate limiting, CORS et montants Stripe sont définis
// à un seul endroit. Le proxy Vite (vite.config.js) réécrit /api/* vers ce serveur.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";

// Imports dynamiques : les handlers lisent process.env à l'évaluation du module
// (instanciation Stripe), donc ils doivent être chargés après dotenv.config().
const { default: createCheckoutSession } = await import("./api/create-checkout-session.js");
const { default: verifySession } = await import("./api/verify-session.js");
const { default: vehicleAvailability } = await import("./api/vehicle-availability.js");
const { default: sendReservationEmail } = await import("./api/send-reservation-email.js");
const { default: stripeWebhook } = await import("./api/stripe-webhook.js");

const app = express();
const PORT = 3001;

// Monté avant express.json() : la vérification de signature Stripe lit le flux brut
// elle-même. Test local : `stripe listen --forward-to localhost:3001/stripe-webhook`.
app.post("/stripe-webhook", stripeWebhook);

app.use(express.json());

app.post("/create-checkout-session", createCheckoutSession);
app.post("/verify-session", verifySession);
app.get("/vehicle-availability", vehicleAvailability);
app.post("/send-reservation-email", sendReservationEmail);

app.listen(PORT, () => {
  console.log(`✅ Serveur Stripe local → http://localhost:${PORT}`);
});
