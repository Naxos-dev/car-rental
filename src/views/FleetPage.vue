<template>
  <div class="fleet-page">
    <div class="container">
      <div class="page-header">
        <button class="btn-back" @click="router.back()">← Retour</button>
        <h1 class="page-title">Véhicules disponibles</h1>
        <p
          class="page-subtitle"
          v-if="searchStore.startDate && searchStore.endDate"
        >
          Du {{ formatDate(searchStore.startDate) }} au
          {{ formatDate(searchStore.endDate) }} —
          {{ searchStore.location }}
        </p>
      </div>

      <div v-if="vehicleStore.loading" class="fleet-loading">
        Chargement des véhicules...
      </div>
      <div v-else-if="availableVehicles.length === 0" class="fleet-empty">
        Aucun véhicule disponible pour les dates sélectionnées.
      </div>
      <div class="fleet-grid" v-else>
        <div class="vehicle-card" v-for="v in availableVehicles" :key="v.id">
          <div class="vehicle-img-wrapper">
            <img
              :src="v.photoURL"
              :alt="`${v.marque} ${v.modele}`"
              class="vehicle-img"
            />
            <span class="dispo-badge dispo-badge--on">✅ Disponible</span>
          </div>
          <div class="vehicle-info">
            <h3>{{ v.marque }} {{ v.modele }}</h3>
            <div class="vehicle-tags">
              <span class="tag">⛽ {{ v.carburant }}</span>
              <span class="tag">👥 {{ v.places }} places</span>
              <span class="tag tag--price">💶 {{ v.prix }}€/jour</span>
            </div>
            <button class="btn-reserve" @click="openReservation(v)">
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>

    <ReservationModal
      :vehicle="selectedVehicle"
      :visible="!!selectedVehicle"
      @close="selectedVehicle = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ReservationModal from "../components/ReservationModal.vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import { searchStore } from "../store/search.js";
import { userAuthStore } from "../store/userAuth.js";

const router = useRouter();
const selectedVehicle = ref(null);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

const unavailableVehicleIds = computed(() => {
  if (!searchStore.startDate || !searchStore.endDate) return new Set();
  const selStart = new Date(searchStore.startDate);
  const selEnd = new Date(searchStore.endDate);
  return new Set(
    reservationStore.reservations
      .filter(
        (r) =>
          ["payee", "confirmee"].includes(r.statut) &&
          new Date(r.startDate) <= selEnd &&
          new Date(r.endDate) >= selStart,
      )
      .map((r) => r.vehicleId),
  );
});

const availableVehicles = computed(() =>
  vehicleStore.vehicles.filter(
    (v) => v.disponible && !unavailableVehicleIds.value.has(v.id),
  ),
);

function openReservation(vehicle) {
  if (!userAuthStore.isAuthenticated) {
    router.push({ path: "/auth", query: { redirect: "/fleet" } });
    return;
  }
  selectedVehicle.value = vehicle;
}
</script>

<style scoped>
.fleet-page {
  min-height: 100vh;
  background: #f8f9ff;
  padding: 3rem 0 5rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.page-header {
  margin-bottom: 2.5rem;
}
.btn-back {
  background: none;
  border: none;
  color: #e63946;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  display: inline-block;
}
.btn-back:hover {
  text-decoration: underline;
}
.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.4rem;
}
.page-subtitle {
  color: #666;
  font-size: 0.95rem;
}
.fleet-loading,
.fleet-empty {
  text-align: center;
  color: #999;
  padding: 3rem;
}
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.vehicle-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: transform 0.2s;
}
.vehicle-card:hover {
  transform: translateY(-4px);
}
.vehicle-img-wrapper {
  position: relative;
}
.vehicle-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
.dispo-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.dispo-badge--on {
  background: rgba(46, 125, 50, 0.9);
  color: #fff;
}
.vehicle-info {
  padding: 1.2rem;
}
.vehicle-info h3 {
  margin: 0 0 0.6rem;
  color: #1a1a2e;
  font-size: 1.05rem;
}
.vehicle-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.tag {
  background: #f0f4ff;
  color: #1a1a2e;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.tag--price {
  background: #fff3e0;
  color: #e65100;
}
.btn-reserve {
  width: 100%;
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-reserve:hover {
  background: #c1121f;
}
</style>
