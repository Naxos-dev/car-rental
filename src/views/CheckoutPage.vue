<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">Récapitulatif de votre réservation</h1>

      <div class="checkout-grid">
        <!-- ── Colonne gauche : résumé ── -->
        <div class="checkout-summary">
          <!-- Véhicule -->
          <div class="summary-section">
            <h2>🚗 Véhicule sélectionné</h2>
            <div class="vehicle-recap">
              <img
                :src="vehicle.photoURL"
                :alt="vehicleLabel"
                class="vehicle-recap-img"
              />
              <div>
                <strong class="vehicle-recap-name">{{ vehicleLabel }}</strong>
                <div class="recap-tags">
                  <span class="tag">⛽ {{ vehicle.carburant }}</span>
                  <span class="tag">👥 {{ vehicle.places }} places</span>
                  <span class="tag tag--price"
                    >💶 {{ vehicle.prix }}€/jour</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="summary-section">
            <h2>📅 Détails de la réservation</h2>
            <div class="detail-row">
              <span>📍 Lieu</span>
              <strong>{{ store.location }}</strong>
            </div>
            <div class="detail-row">
              <span>Début</span>
              <strong>{{ store.startDate }} à {{ store.startTime }}</strong>
            </div>
            <div class="detail-row">
              <span>Fin</span>
              <strong>{{ store.endDate }} à {{ store.endTime }}</strong>
            </div>
            <div class="detail-row">
              <span>⏱ Durée</span>
              <strong>{{ nbJours }} jour{{ nbJours > 1 ? "s" : "" }}</strong>
            </div>
          </div>

          <!-- Client -->
          <div class="summary-section">
            <h2>👤 Vos informations</h2>
            <div class="detail-row">
              <span>Nom</span>
              <strong>{{ store.nom }}</strong>
            </div>
            <div class="detail-row">
              <span>Email</span>
              <strong>{{ store.email }}</strong>
            </div>
            <div v-if="store.telephone" class="detail-row">
              <span>Téléphone</span>
              <strong>{{ store.telephone }}</strong>
            </div>
          </div>
        </div>

        <!-- ── Colonne droite : paiement ── -->
        <div class="checkout-payment">
          <div class="price-box">
            <div class="price-row">
              <span
                >{{ vehicle.prix }}€ × {{ nbJours }} jour{{
                  nbJours > 1 ? "s" : ""
                }}</span
              >
              <span>{{ store.total }}€</span>
            </div>
            <div class="price-total">
              <span>Total TTC</span>
              <strong>{{ store.total }}€</strong>
            </div>
          </div>

          <button class="btn-pay" :disabled="paying" @click="handlePay">
            <span v-if="paying">⏳ Redirection en cours...</span>
            <span v-else>💳 Payer {{ store.total }}€ avec Stripe</span>
          </button>

          <p v-if="payError" class="pay-error">⚠️ {{ payError }}</p>

          <p class="secure-note">🔒 Paiement 100% sécurisé par Stripe</p>

          <button class="btn-back" @click="router.back()">
            ← Modifier la réservation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { checkoutStore } from "../store/checkout.js";

const router = useRouter();
const store = checkoutStore;

onMounted(() => {
  if (!store.vehicle) router.replace("/");
});

const vehicle = computed(() => store.vehicle ?? {});
const vehicleLabel = computed(
  () => `${vehicle.value.marque} ${vehicle.value.modele}`,
);
const nbJours = computed(() => store.nbJours);

const paying = ref(false);
const payError = ref("");

async function handlePay() {
  paying.value = true;
  payError.value = "";
  try {
    const apiUrl = import.meta.env.VITE_CHECKOUT_FUNCTION_URL || "/api/create-checkout-session";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: store.total,
        vehicleLabel: vehicleLabel.value,
        customerEmail: store.email,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/checkout`,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur serveur (${res.status})`);
    }
    const data = await res.json();
    if (data.url) {
      // Persister les données avant le rechargement de page causé par la redirection Stripe
      sessionStorage.setItem(
        "pendingReservation",
        JSON.stringify({
          vehicle: { ...store.vehicle },
          nom: store.nom,
          email: store.email,
          telephone: store.telephone,
          location: store.location,
          startDate: store.startDate,
          startTime: store.startTime,
          endDate: store.endDate,
          endTime: store.endTime,
        }),
      );
      window.location.href = data.url;
    } else {
      throw new Error("URL de paiement non reçue");
    }
  } catch (err) {
    console.error("[Checkout] Erreur paiement:", err);
    payError.value = err.message || "Une erreur est survenue. Vérifiez la configuration Stripe.";
    paying.value = false;
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f8f9ff;
  padding: 3rem 0 5rem;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 2rem;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

/* Summary */
.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.summary-section {
  background: #fff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.summary-section h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1rem;
}
.vehicle-recap {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.vehicle-recap-img {
  width: 110px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.vehicle-recap-name {
  display: block;
  font-size: 1.05rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}
.recap-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag {
  background: #f0f4ff;
  color: #1a1a2e;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}
.tag--price {
  background: #fff3e0;
  color: #e65100;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.45rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.92rem;
  color: #555;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-row strong {
  color: #1a1a2e;
}

/* Payment */
.checkout-payment {
  background: #fff;
  border-radius: 14px;
  padding: 1.8rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.price-box {
  border: 1px solid #e8eaf6;
  border-radius: 10px;
  padding: 1rem;
}
.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.8rem;
}
.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  border-top: 1px solid #e8eaf6;
  padding-top: 0.8rem;
}
.price-total strong {
  font-size: 1.5rem;
  color: #e63946;
}
.btn-pay {
  width: 100%;
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-pay:hover:not(:disabled) {
  background: #c1121f;
}
.btn-pay:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.pay-error {
  color: #c1121f;
  font-size: 0.88rem;
  text-align: center;
}
.secure-note {
  font-size: 0.82rem;
  color: #888;
  text-align: center;
}
.btn-back {
  background: none;
  border: none;
  color: #888;
  font-size: 0.88rem;
  cursor: pointer;
  text-align: center;
  text-decoration: underline;
}
</style>
