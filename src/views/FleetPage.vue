<template>
  <div class="fleet-page">
    <div class="container">
      <div class="page-header">
        <button class="btn-back" @click="goBack()">
          {{ t("fleetPage.back") }}
        </button>
        <h1 class="page-title">{{ t("fleetPage.title") }}</h1>
        <p
          class="page-subtitle"
          v-if="searchStore.startDate && searchStore.endDate"
        >
          {{
            t("fleetPage.subtitle", {
              start: formatDate(searchStore.startDate, { day: 'numeric', month: 'long' }),
              end: formatDate(searchStore.endDate, { day: 'numeric', month: 'long' }),
              location: searchStore.location,
            })
          }}
        </p>
      </div>

      <div v-if="route.query.redirected === '1'" class="notice-banner" role="alert">
        {{ t("fleetPage.redirectedNotice") }}
      </div>

      <div class="filters-panel" v-if="!vehicleStore.loading && !rangesLoading">
        <div class="filters-grid">
          <label class="filter-field">
            <span>{{ t("fleetPage.filters.location") }}</span>
            <select id="filter-location" name="filter-location" v-model="searchStore.location">
              <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.nom">{{ loc.nom }}</option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.brand") }}</span>
            <select id="filter-brand" name="filter-brand" v-model="selectedMarque">
              <option value="all">{{ t("fleetPage.filters.anyBrand") }}</option>
              <option v-for="marque in marqueOptions" :key="marque" :value="marque">
                {{ marque }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.fuel") }}</span>
            <select id="filter-fuel" name="filter-fuel" v-model="selectedFuel">
              <option value="all">{{ t("fleetPage.filters.anyFuel") }}</option>
              <option v-for="fuel in fuelOptions" :key="fuel" :value="fuel">
                {{ t(`fuel.${fuel}`) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.seats") }}</span>
            <select id="filter-seats" name="filter-seats" v-model="selectedSeats">
              <option value="all">{{ t("fleetPage.filters.anySeats") }}</option>
              <option v-for="seat in seatOptions" :key="seat" :value="seat">
                {{ t("fleetPage.filters.seatsAtLeast", { n: seat }) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>{{ t("fleetPage.filters.maxPrice") }}</span>
            <div class="price-filter">
              <span class="price-bound">0€</span>
              <input
                id="filter-max-price"
                name="filter-max-price"
                type="range"
                :key="highestPrice"
                :min="0"
                :max="highestPrice"
                :step="1"
                v-model.number="selectedMaxPrice"
                :aria-valuemin="0"
                :aria-valuemax="highestPrice"
                :aria-valuenow="selectedMaxPrice"
                :aria-label="t('fleetPage.filters.maxPrice')"
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
              filteredVehicles.length === 1
                ? t("fleetPage.filters.resultOne")
                : t("fleetPage.filters.results", { count: filteredVehicles.length })
            }}
          </p>
        </div>
      </div>

      <div v-if="vehicleStore.loading || rangesLoading" class="fleet-grid">
        <VehicleCardSkeleton v-for="n in 9" :key="n" />
      </div>
      <div v-else-if="availableVehicles.length === 0" class="fleet-empty">
        {{ t("fleetPage.empty") }}
      </div>
      <div v-else-if="filteredVehicles.length === 0" class="fleet-empty">
        <p>{{ t("fleetPage.emptyFiltered") }}</p>
        <div class="active-filters" v-if="selectedMarque !== 'all' || selectedFuel !== 'all' || selectedSeats !== 'all' || selectedMaxPrice < highestPrice">
          <button v-if="selectedMarque !== 'all'" class="filter-chip" type="button" @click="selectedMarque = 'all'">{{ selectedMarque }} ✕</button>
          <button v-if="selectedFuel !== 'all'" class="filter-chip" type="button" @click="selectedFuel = 'all'">{{ t(`fuel.${selectedFuel}`) }} ✕</button>
          <button v-if="selectedSeats !== 'all'" class="filter-chip" type="button" @click="selectedSeats = 'all'">{{ t("fleetPage.filters.seatsAtLeast", { n: selectedSeats }) }} ✕</button>
          <button v-if="selectedMaxPrice < highestPrice" class="filter-chip" type="button" @click="selectedMaxPrice = highestPrice">≤ {{ selectedMaxPrice }}€ ✕</button>
        </div>
        <button class="btn-reset-cta" type="button" @click="resetFilters">
          {{ t("fleetPage.filters.reset") }}
        </button>
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
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { formatDate } from "../composables/useFormatDate.js";

import ReservationModal from "../components/ReservationModal.vue";
import VehicleCard from "../components/VehicleCard.vue";
import VehicleCardSkeleton from "../components/VehicleCardSkeleton.vue";
import { vehicleStore } from "../store/vehicles.js";
import { searchStore } from "../store/search.js";
import { locationStore } from "../store/locations.js";
import { authStore as userAuthStore } from "../store/auth.js";
import { useReservedRanges } from "../composables/useReservedRanges.js";
import { getEffectivePricePerDay } from "../utils/pricing.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const selectedVehicle = ref(null);

onMounted(() => {
  const vehicleId = route.query.vehicleId;
  if (!vehicleId || !userAuthStore.isAuthenticated) return;
  const tryOpen = () => {
    const vehicle = vehicleStore.vehicles.find((v) => v.id === vehicleId && v.disponible);
    if (vehicle) { selectedVehicle.value = vehicle; return true; }
    return false;
  };
  if (!tryOpen()) {
    const unwatch = watch(() => vehicleStore.vehicles, () => { if (tryOpen()) unwatch(); });
  }
});

const { ranges: reservedRanges, loading: rangesLoading, fetchAll: fetchReservedRanges } = useReservedRanges();

watch(
  [() => searchStore.startDate, () => searchStore.endDate],
  ([startDate, endDate]) => {
    if (startDate && endDate) fetchReservedRanges();
  },
  { immediate: true },
);

const unavailableVehicleIds = computed(() => {
  if (!searchStore.startDate || !searchStore.endDate) return new Set();
  const selStart = new Date(searchStore.startDate);
  const selEnd = new Date(searchStore.endDate);
  return new Set(
    reservedRanges.value
      .filter(
        (r) =>
          new Date(r.startDate) <= selEnd &&
          new Date(r.endDate) >= selStart,
      )
      .map((r) => r.vehicleId),
  );
});

const availableVehicles = computed(() =>
  vehicleStore.vehicles.filter(
    (v) =>
      v.disponible &&
      !unavailableVehicleIds.value.has(v.id) &&
      (!searchStore.location || v.lieu === searchStore.location),
  ),
);

const selectedMarque = ref("all");
const selectedFuel = ref("all");
const selectedSeats = ref("all");
const selectedMaxPrice = ref(0);

function effectivePrice(vehicle) {
  return getEffectivePricePerDay(
    vehicle,
    searchStore.startDate,
    searchStore.endDate,
    searchStore.startTime,
    searchStore.endTime,
  );
}

const marqueOptions = computed(() =>
  [
    ...new Set(availableVehicles.value.map((v) => v.marque).filter(Boolean)),
  ].sort(),
);

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
  Math.max(0, ...availableVehicles.value.map((v) => effectivePrice(v))),
);

watch(
  highestPrice,
  (newPrice, oldPrice) => {
    if (!selectedMaxPrice.value || selectedMaxPrice.value >= (oldPrice ?? newPrice)) {
      selectedMaxPrice.value = newPrice;
    }
  },
  { immediate: true },
);

const filteredVehicles = computed(() =>
  availableVehicles.value.filter((vehicle) => {
    const price = effectivePrice(vehicle);
    const seats = Number(vehicle.places) || 0;

    if (selectedMarque.value !== "all" && vehicle.marque !== selectedMarque.value) {
      return false;
    }
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
  selectedMarque.value = "all";
  selectedFuel.value = "all";
  selectedSeats.value = "all";
  selectedMaxPrice.value = highestPrice.value;
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/");
}

function openReservation(vehicle) {
  if (!userAuthStore.isAuthenticated) {
    router.push({ path: "/auth", query: { redirect: `/fleet?vehicleId=${vehicle.id}` } });
    return;
  }
  selectedVehicle.value = vehicle;
}
</script>

<style scoped>
.fleet-page {
  min-height: 100vh;
  background: var(--color-bg-page);
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
  color: var(--color-primary);
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
  color: var(--color-navy);
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
  color: var(--color-navy);
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
  gap: 0.5rem;
}
.price-filter input {
  flex: 1;
}
.price-bound {
  font-size: 0.78rem;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}
.price-value {
  text-align: right;
  font-weight: 700;
  color: #e65100;
  white-space: nowrap;
  flex-shrink: 0;
}
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.filter-chip {
  background: #e8eaf6;
  color: var(--color-navy);
  border: none;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.filter-chip:hover {
  background: #d0d4f0;
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
  color: var(--color-navy);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-reset:hover {
  border-color: var(--color-navy);
}
.results-count {
  margin: 0;
  font-size: 0.9rem;
  color: #5c5f6f;
  font-weight: 600;
}
.notice-banner {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  color: #e65100;
  font-weight: 600;
}
.fleet-loading,
.fleet-empty {
  text-align: center;
  color: #999;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.btn-reset-cta {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-reset-cta:hover { background: var(--color-primary-dark); }
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .filters-panel {
    padding: 0.85rem;
  }
}

@media (max-width: 480px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
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
