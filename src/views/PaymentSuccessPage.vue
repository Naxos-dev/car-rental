<template>
  <div class="success-page">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1>Paiement confirmé !</h1>
        <p>
          Votre réservation a bien été enregistrée. Un récapitulatif vous sera
          envoyé à <strong>{{ email }}</strong
          >.
        </p>

        <div v-if="recap" class="reservation-recap">
          <div class="recap-row">🚗 {{ recap.vehicleLabel }}</div>
          <div class="recap-row">📍 {{ recap.location }}</div>
          <div class="recap-row">
            📅 {{ recap.startDate }} → {{ recap.endDate }}
          </div>
        </div>

        <router-link to="/" class="btn-home">← Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { checkoutStore } from "../store/checkout.js";
import { reservationStore } from "../store/reservations.js";
import { userAuthStore } from "../store/userAuth.js";

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
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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
}
.btn-home {
  display: inline-block;
  background: #e63946;
  color: #fff;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  transition: background 0.2s;
}
.btn-home:hover {
  background: #c1121f;
}
</style>
