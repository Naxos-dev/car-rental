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

      <div class="filters-panel" v-if="!vehicleStore.loading">
        <div class="filters-grid">
          <label class="filter-field">
            <span>{{ t("fleetPage.filters.fuel") }}</span>
            <select v-model="selectedFuel">
              <option value="all">{{ t("fleetPage.filters.anyFuel") }}</option>
              <option v-for="fuel in fuelOptions" :key="fuel" :value="fuel">
                {{ t(`fuel.${fuel}`) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.seats") }}</span>
            <select v-model="selectedSeats">
              <option value="all">{{ t("fleetPage.filters.anySeats") }}</option>
              <option v-for="seat in seatOptions" :key="seat" :value="seat">
                {{ t("fleetPage.filters.seatsAtLeast", { n: seat }) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.maxPrice") }}</span>
            <div class="price-filter">
              <input
                type="range"
                :min="0"
                :max="highestPrice"
                :step="1"
                v-model.number="selectedMaxPrice"
              />
              <div class="price-value">{{ selectedMaxPrice }}€</div>
            </div>
          </label>
        </div>

        <div class="filters-actions">
          <button class="btn-reset" type="button" @click="resetFilters">
            {{ t("fleetPage.filters.reset") }}
          </button>
          <p class="results-count">
            {{
              t("fleetPage.filters.results", { count: filteredVehicles.length })
            }}
          </p>
        </div>
      </div>

      <div v-if="vehicleStore.loading" class="fleet-grid">
        <VehicleCardSkeleton v-for="n in 9" :key="n" />
      </div>
      <div v-else-if="availableVehicles.length === 0" class="fleet-empty">
        {{ t("fleetPage.empty") }}
      </div>
      <div v-else-if="filteredVehicles.length === 0" class="fleet-empty">
        {{ t("fleetPage.emptyFiltered") }}
      </div>
      <div class="fleet-grid" v-else>
        <VehicleCard
          v-for="v in filteredVehicles"
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
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ReservationModal from "../components/ReservationModal.vue";
import VehicleCard from "../components/VehicleCard.vue";
import VehicleCardSkeleton from "../components/VehicleCardSkeleton.vue";
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
          r.statut === "confirmee" &&
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

const selectedFuel = ref("all");
const selectedSeats = ref("all");
const selectedMaxPrice = ref(0);

const fuelOptions = computed(() =>
  [
    ...new Set(availableVehicles.value.map((v) => v.carburant).filter(Boolean)),
  ].sort(),
);

const seatOptions = computed(() =>
  [
    ...new Set(
      availableVehicles.value.map((v) => Number(v.places)).filter(Boolean),
    ),
  ].sort((a, b) => a - b),
);

const highestPrice = computed(() =>
  Math.max(0, ...availableVehicles.value.map((v) => Number(v.prix) || 0)),
);

watch(
  highestPrice,
  (price) => {
    if (!selectedMaxPrice.value || selectedMaxPrice.value > price) {
      selectedMaxPrice.value = price;
    }
  },
  { immediate: true },
);

const filteredVehicles = computed(() =>
  availableVehicles.value.filter((vehicle) => {
    const price = Number(vehicle.prix) || 0;
    const seats = Number(vehicle.places) || 0;

    if (
      selectedFuel.value !== "all" &&
      vehicle.carburant !== selectedFuel.value
    ) {
      return false;
    }
    if (selectedSeats.value !== "all" && seats < Number(selectedSeats.value)) {
      return false;
    }
    if (price > selectedMaxPrice.value) {
      return false;
    }
    return true;
  }),
);

function resetFilters() {
  selectedFuel.value = "all";
  selectedSeats.value = "all";
  selectedMaxPrice.value = highestPrice.value;
}

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
.filters-panel {
  background: #ffffff;
  border: 1px solid #e7e9ff;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.vehicle-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: transform 0.2s;
}
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.filter-field span {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 0.86rem;
}
.filter-field select {
  border: 1px solid #d8dced;
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  font-size: 0.92rem;
  background: #fff;
}
.price-filter {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.price-filter input {
  flex: 1;
}
.price-value {
  min-width: 72px;
  text-align: right;
  font-weight: 700;
  color: #e65100;
}
.filters-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.9rem;
}
.btn-reset {
  border: 1px solid #d8dced;
  background: #fff;
  color: #1a1a2e;
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-reset:hover {
  border-color: #1a1a2e;
}
.results-count {
  margin: 0;
  font-size: 0.9rem;
  color: #5c5f6f;
  font-weight: 600;
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

@media (max-width: 1024px) {
  .fleet-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .fleet-page {
    padding: 1.5rem 0 4rem;
  }
  .page-title {
    font-size: 1.4rem;
  }
  .fleet-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
