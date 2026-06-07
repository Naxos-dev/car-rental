<template>
  <div class="fleet-page">
    <div class="container">
      <div class="page-header">
        <button class="btn-back" @click="router.back()">
          {{ t("fleetPage.back") }}
        </button>
        <h1 class="page-title">{{ t("fleetPage.title") }}</h1>
        <p
          class="page-subtitle"
          v-if="searchStore.startDate && searchStore.endDate"
        >
          {{
            t("fleetPage.subtitle", {
              start: formatDate(searchStore.startDate),
              end: formatDate(searchStore.endDate),
              location: searchStore.location,
            })
          }}
        </p>
      </div>

      <div v-if="vehicleStore.loading" class="fleet-loading">
        {{ t("fleetPage.loading") }}
      </div>
      <div v-else-if="availableVehicles.length === 0" class="fleet-empty">
        {{ t("fleetPage.empty") }}
      </div>
      <div class="fleet-grid" v-else>
        <VehicleCard
          v-for="v in availableVehicles"
          :key="v.id"
          :vehicle="v"
          @reserve="openReservation"
        />
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
import { useI18n } from "vue-i18n";
import ReservationModal from "../components/ReservationModal.vue";
import VehicleCard from "../components/VehicleCard.vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import { searchStore } from "../store/search.js";
import { userAuthStore } from "../store/userAuth.js";

const { t } = useI18n();
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

@media (max-width: 768px) {
  .fleet-page {
    padding: 2rem 0 4rem;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .fleet-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .fleet-grid {
    grid-template-columns: 1fr;
  }
}
</style>
