<template>
  <div class="success-page">
    <div class="container">

      <!-- Vérification en cours -->
      <div v-if="loading" class="success-card" aria-live="polite" aria-busy="true">
        <div class="loading-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
        <p class="loading-text">{{ t("success.verifying") }}</p>
      </div>

      <!-- Erreur de vérification -->
      <div v-else-if="verifyError" class="success-card error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1>{{ t("success.errorTitle") }}</h1>
        <p>{{ verifyError }}</p>
        <router-link to="/fleet" class="btn-home btn-home--secondary">
          {{ t("success.backToFleet") }}
        </router-link>
      </div>

      <!-- Succès -->
      <div v-else class="success-card">
        <div class="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1>{{ t("success.title") }}</h1>
        <p>
          {{ t("success.desc") }} <strong>{{ email }}</strong>.
        </p>

        <div v-if="writeWarning" class="write-warning" role="alert">
          {{ t("success.writeWarning") }}
        </div>

        <div v-if="recap" class="reservation-recap">
          <img
            v-if="recap.photoURL && !recapImgFailed"
            :src="recap.photoURL"
            :alt="recap.vehicleLabel"
            class="recap-vehicle-img"
            @error="recapImgFailed = true"
          />
          <div v-else class="recap-vehicle-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div class="recap-row">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            {{ recap.vehicleLabel }}
          </div>
          <div class="recap-row">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ recap.location }}
          </div>
          <div class="recap-row">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {{ formatDate(recap.startDate) }} → {{ formatDate(recap.endDate) }}
          </div>
        </div>

        <router-link to="/" class="btn-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="home-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {{ t("success.backHome") }}
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { reservationStore } from "../store/reservations.js";
import { authStore as userAuthStore } from "../store/auth.js";
import { checkoutStore } from "../store/checkout.js";
import { formatDate as _formatDate } from "../composables/useFormatDate.js";
import { cloudinaryThumb } from "../utils/cloudinaryUtils.js";

const { t } = useI18n();

function formatDate(iso) {
  return _formatDate(iso, { day: "numeric", month: "short", year: "numeric" });
}
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const verifyError = ref("");
const writeWarning = ref(false);
const email = ref("");
const recap = ref(null);
const recapImgFailed = ref(false);

let _stopAuthWatch = null;
onUnmounted(() => { _stopAuthWatch?.(); _stopAuthWatch = null; });

function getVerifyUrl() {
  const checkoutUrl = import.meta.env.VITE_CHECKOUT_FUNCTION_URL;
  if (checkoutUrl) {
    // Derive verify-session URL from the checkout function URL (same base path).
    return checkoutUrl.replace(/\/[^/]+$/, "/verify-session");
  }
  return "/api/verify-session";
}


onMounted(async () => {
  const sessionId = route.query.session_id;

  if (!sessionId) {
    router.replace("/fleet");
    return;
  }

  try {
    const res = await fetch(getVerifyUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Vérification échouée");
    }

    const { metadata } = await res.json();

    email.value = metadata.email || t("success.fallbackEmail");

    const rawUrl = metadata.photoURL;
    const photoURL = cloudinaryThumb(rawUrl, 480, 270) || null;

    recap.value = {
      vehicleLabel: metadata.vehicleLabel,
      location: metadata.location,
      startDate: metadata.startDate,
      endDate: metadata.endDate,
      photoURL,
    };

    // Wait for Firebase auth to resolve before writing so userId comes from the verified
    // session, not from attacker-controllable Stripe metadata.
    if (userAuthStore.loading) {
      await new Promise((resolve) => {
        const stop = watch(() => userAuthStore.loading, (isLoading) => {
          if (!isLoading) { _stopAuthWatch = null; stop(); resolve(); }
        });
        _stopAuthWatch = stop;
        setTimeout(() => { _stopAuthWatch = null; stop(); resolve(); }, 5000);
      });
      _stopAuthWatch = null;
    }

    // Use session ID as document ID — safe to call twice (transaction guard inside).
    // If the write fails (e.g. browser crash, network), the payment is already captured.
    // A non-availability write error shows a warning rather than hiding the payment confirmation.
    try {
      await reservationStore.addReservationWithId(sessionId, {
        vehicleId: metadata.vehicleId,
        vehicleLabel: metadata.vehicleLabel,
        nom: metadata.nom,
        email: metadata.email,
        telephone: metadata.telephone,
        location: metadata.location,
        startDate: metadata.startDate,
        startTime: metadata.startTime,
        endDate: metadata.endDate,
        endTime: metadata.endTime,
        vehiclePhoto: rawUrl || "",
        userId: userAuthStore.user?.uid ?? null,
        stripeSessionId: sessionId,
        statut: "confirmee",
      });
      checkoutStore.clear();
    } catch (writeErr) {
      if (writeErr.code === "AVAILABILITY_ERROR") throw writeErr;
      console.error("[PaymentSuccess] Erreur écriture réservation:", writeErr);
      writeWarning.value = true;
    }
  } catch (err) {
    console.error("[PaymentSuccess] Erreur vérification:", err);
    verifyError.value = err.code === "AVAILABILITY_ERROR"
      ? t("success.doubleBooking")
      : t("success.errorDesc");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}
.container {
  max-width: 520px;
  width: 100%;
}
.success-card {
  background: #fff;
  border-radius: 18px;
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .success-card {
    padding: 2rem 1.25rem;
    border-radius: 14px;
  }
  h1 {
    font-size: 1.4rem;
  }
}

/* Loading state */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
}
.loading-icon svg {
  width: 64px;
  height: 64px;
  stroke: var(--color-primary);
  animation: spin 0.9s linear infinite;
}
.loading-text {
  color: #666;
  font-size: 1rem;
}

/* Error state */
.error-card {
  border-top: 4px solid #c62828;
}
.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fce4ec;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.error-icon svg {
  width: 32px;
  height: 32px;
  stroke: #c62828;
}

/* Success state */
.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.success-icon svg {
  width: 36px;
  height: 36px;
  stroke: #16a34a;
}
h1 {
  font-size: 1.8rem;
  color: var(--color-navy);
  margin-bottom: 0.8rem;
}
p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.write-warning {
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  color: #e65100;
  text-align: left;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.reservation-recap {
  background: #f0f4ff;
  border-radius: 10px;
  padding: 0 0 1rem;
  margin-bottom: 2rem;
  text-align: left;
  overflow: hidden;
}
.recap-vehicle-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  margin-bottom: 1rem;
}
.recap-vehicle-placeholder {
  width: 100%;
  height: 160px;
  background: #e8ecf5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.recap-vehicle-placeholder svg {
  width: 56px;
  height: 56px;
  stroke: #9aa0c0;
}
.recap-row {
  font-size: 0.92rem;
  color: var(--color-navy);
  padding: 0.3rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.recap-row svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  stroke: #555;
}
.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  transition: background 0.2s;
}
.btn-home--secondary {
  background: var(--color-navy);
}
.btn-home--secondary:hover {
  background: #2d2d4e;
}
.home-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.btn-home:hover:not(.btn-home--secondary) {
  background: var(--color-primary-dark);
}
</style>
