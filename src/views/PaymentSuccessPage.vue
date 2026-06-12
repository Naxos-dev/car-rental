<template>
  <div class="success-page">
    <div class="container">
      <div class="success-card">
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
          {{ t("success.desc") }} <strong>{{ email }}</strong
          >.
        </p>

        <div v-if="recap" class="reservation-recap">
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
            {{ recap.startDate }} → {{ recap.endDate }}
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
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { checkoutStore } from "../store/checkout.js";
import { reservationStore } from "../store/reservations.js";
import { userAuthStore } from "../store/userAuth.js";

const { t } = useI18n();

const email = ref("");
const recap = ref(null);

onMounted(async () => {
  // La redirection Stripe provoque un rechargement complet : restaurer depuis sessionStorage
  if (!checkoutStore.vehicle) {
    const saved = sessionStorage.getItem("pendingReservation");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        Object.assign(checkoutStore, d);
      } catch {
        // données corrompues, on ignore
      }
    }
  }
  sessionStorage.removeItem("pendingReservation");

  email.value = checkoutStore.email || "votre adresse email";

  if (checkoutStore.vehicle) {
    recap.value = {
      vehicleLabel: `${checkoutStore.vehicle.marque} ${checkoutStore.vehicle.modele}`,
      location: checkoutStore.location,
      startDate: checkoutStore.startDate,
      endDate: checkoutStore.endDate,
    };

    // Enregistrement de la réservation confirmée dans Firestore
    await reservationStore.addReservation({
      vehicleId: checkoutStore.vehicle.id,
      vehicleLabel: `${checkoutStore.vehicle.marque} ${checkoutStore.vehicle.modele}`,
      nom: checkoutStore.nom,
      email: checkoutStore.email,
      telephone: checkoutStore.telephone,
      location: checkoutStore.location,
      startDate: checkoutStore.startDate,
      startTime: checkoutStore.startTime,
      endDate: checkoutStore.endDate,
      endTime: checkoutStore.endTime,
      userId: userAuthStore.user?.uid ?? null,
      statut: "payee",
    });

    checkoutStore.clear();
  }
});
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: #f8f9ff;
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
  color: #1a1a2e;
  margin-bottom: 0.8rem;
}
p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.reservation-recap {
  background: #f0f4ff;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}
.recap-row {
  font-size: 0.92rem;
  color: #1a1a2e;
  padding: 0.3rem 0;
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
  background: #e63946;
  color: #fff;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  transition: background 0.2s;
}
.home-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.btn-home:hover {
  background: #c1121f;
}
</style>
