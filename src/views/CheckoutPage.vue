<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">{{ t("checkout.title") }}</h1>

      <div class="checkout-grid">
        <!-- ── Colonne gauche : résumé ── -->
        <div class="checkout-summary">
          <!-- Véhicule -->
          <div class="summary-section">
            <h2>{{ t("checkout.vehicle") }}</h2>
            <div class="vehicle-recap">
              <img
                v-if="thumbUrl"
                :src="thumbUrl"
                :alt="vehicleLabel"
                class="vehicle-recap-img"
                @error="(e) => e.target.style.display = 'none'"
              />
              <div>
                <strong class="vehicle-recap-name">{{ vehicleLabel }}</strong>
                <div class="recap-tags">
                  <span class="tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    {{ fuelMap[vehicle.carburant] || vehicle.carburant }}
                  </span>
                  <span class="tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {{ vehicle.places }} {{ t("fleet.seats") }}
                  </span>
                  <span class="tag tag--price">
                    {{ vehicle.prix }}{{ t("fleet.perDay") }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="summary-section">
            <h2>{{ t("checkout.reservationDetails") }}</h2>
            <div class="detail-row">
              <span>{{ t("checkout.location") }}</span>
              <strong>{{ store.location }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("checkout.start") }}</span>
              <strong>{{ formatDate(store.startDate) }} {{ t("checkout.atTime") }} {{ store.startTime }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("checkout.end") }}</span>
              <strong>{{ formatDate(store.endDate) }} {{ t("checkout.atTime") }} {{ store.endTime }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("checkout.duration") }}</span>
              <strong
                >{{ nbJours }}
                {{
                  nbJours > 1 ? t("checkout.days") : t("checkout.day")
                }}</strong
              >
            </div>
          </div>

          <!-- Client -->
          <div class="summary-section">
            <h2>{{ t("checkout.clientInfo") }}</h2>
            <div class="detail-row">
              <span>{{ t("checkout.name") }}</span>
              <strong>{{ store.nom }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("checkout.email") }}</span>
              <strong>{{ store.email }}</strong>
            </div>
            <div v-if="store.telephone" class="detail-row">
              <span>{{ t("checkout.phone") }}</span>
              <strong>{{ store.telephone }}</strong>
            </div>
          </div>
        </div>

        <!-- ── Colonne droite : paiement ── -->
        <div class="checkout-payment">
          <div class="price-box">
            <div class="price-row">
              <span
                >{{ vehicle.prix }}€ × {{ nbJours }}
                {{ nbJours > 1 ? t("checkout.days") : t("checkout.day") }}</span
              >
              <span>{{ store.total }}€</span>
            </div>
            <div class="price-total">
              <span>{{ t("checkout.total") }}</span>
              <strong>{{ store.total }}€</strong>
            </div>
          </div>

          <button class="btn-pay" :disabled="paying" :aria-busy="paying" @click="handlePay">
            <svg v-if="!paying" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pay-icon">
              <rect x="1" y="11" width="22" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pay-icon spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span v-if="paying">{{ t("checkout.paying") }}</span>
            <span v-else>{{ t("checkout.pay", { total: store.total }) }}</span>
          </button>

          <p v-if="payError" class="pay-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pay-error-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ payError }}
          </p>

          <p class="secure-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="secure-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {{ t("checkout.secure") }}
          </p>

          <button class="btn-back" @click="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            {{ t("checkout.back") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { checkoutStore } from "../store/checkout.js";
import { authStore as userAuthStore } from "../store/auth.js";
import { formatDate } from "../composables/useFormatDate.js";
import { cloudinaryThumb } from "../utils/cloudinaryUtils.js";

const { t, tm } = useI18n();
const fuelMap = computed(() => tm("fuel"));
const router = useRouter();
const store = checkoutStore;

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/fleet");
}

const vehicle = computed(() => store.vehicle ?? {});

const thumbUrl = computed(() => cloudinaryThumb(vehicle.value.photoURL, 330, 225));
const vehicleLabel = computed(
  () => `${vehicle.value.marque} ${vehicle.value.modele}`,
);
const nbJours = computed(() => store.nbJours);

const paying = ref(false);
const payError = ref("");

async function handlePay() {
  if (paying.value) return;
  paying.value = true;
  payError.value = "";
  try {
    const apiUrl =
      import.meta.env.VITE_CHECKOUT_FUNCTION_URL ||
      "/api/create-checkout-session";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: store.vehicle.id,
        startDate: store.startDate,
        endDate: store.endDate,
        nom: store.nom,
        email: store.email,
        telephone: store.telephone,
        location: store.location,
        startTime: store.startTime,
        endTime: store.endTime,
        userId: userAuthStore.user?.uid ?? "",
        cancelUrl: `${window.location.origin}/checkout`,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err = new Error(errData.error || `Erreur serveur (${res.status})`);
      if (res.status === 409) err.code = "AVAILABILITY_ERROR";
      throw err;
    }
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("URL de paiement non reçue");
    }
  } catch (err) {
    console.error("[Checkout] Erreur paiement:", err);
    payError.value = err.code === "AVAILABILITY_ERROR"
      ? t("backoffice.vehicleUnavailable")
      : t("checkout.paymentFailed");
    paying.value = false;
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--color-bg-page);
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
  color: var(--color-navy);
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
  .page-title {
    font-size: 1.4rem;
    margin-bottom: 1.25rem;
  }
  .checkout-payment {
    position: static;
  }
  .vehicle-recap {
    flex-direction: column;
    align-items: flex-start;
  }
  .vehicle-recap-img {
    width: 100%;
    height: 160px;
  }
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
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
  color: var(--color-navy);
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
  color: var(--color-navy);
  margin-bottom: 0.5rem;
}
.recap-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag {
  background: #f0f4ff;
  color: var(--color-navy);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.tag-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
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
  color: var(--color-navy);
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
  color: var(--color-primary);
}
.btn-pay {
  width: 100%;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.pay-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 0.8s linear infinite;
}
.btn-pay:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
@media (max-width: 400px) {
  .btn-pay { font-size: 0.88rem; }
  .pay-icon { width: 14px; height: 14px; }
}
.btn-pay:disabled {
  background: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}
.pay-error {
  color: var(--color-primary-dark);
  font-size: 0.88rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.pay-error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.secure-note {
  font-size: 0.82rem;
  color: #888;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
.secure-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
.btn-back {
  background: none;
  border: none;
  color: #888;
  font-size: 0.88rem;
  cursor: pointer;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  width: 100%;
  transition: color 0.2s;
}
.btn-back:hover {
  color: var(--color-navy);
}
.back-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
</style>
