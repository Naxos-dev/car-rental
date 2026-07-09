<template>
  <div class="booking-widget">
    <h3 class="widget-title">{{ t("booking.title") }}</h3>
    <form class="widget-form" @submit.prevent="handleSearch">
      <!-- Localisation -->
      <div class="field">
        <span class="field-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ t("booking.location") }}
        </span>
        <select
          id="location"
          v-model="localLocation"
          class="location-select"
          :aria-label="t('booking.location')"
        >
          <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.nom">{{ loc.nom }}</option>
        </select>
      </div>

      <!-- Période de location -->
      <div :class="['field', { 'field--error': searchError }]">
        <label for="dateRange">{{ t("booking.dateRange") }}</label>
        <DateRangePicker
          inputId="dateRange"
          :startDate="localStartDate"
          :endDate="localEndDate"
          :disabledRanges="[]"
          :placeholder="t('booking.selectDates')"
          @update:startDate="
            localStartDate = $event;
            searchError = '';
          "
          @update:endDate="
            localEndDate = $event;
            searchError = '';
          "
        />
      </div>

      <!-- Heures -->
      <div class="field-group">
        <div class="field">
          <label for="startTime">{{ t("booking.startTime") }}</label>
          <input id="startTime" v-model="localStartTime" type="time" required :lang="timeLang" />
        </div>
        <div class="field">
          <label for="endTime">{{ t("booking.endTime") }}</label>
          <input id="endTime" v-model="localEndTime" type="time" required :lang="timeLang" />
        </div>
      </div>

      <p v-if="searchError" class="search-error" role="alert">
        {{ searchError }}
      </p>

      <button type="submit" class="btn-search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="search-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {{ t("booking.search") }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";
import { locationStore } from "../store/locations.js";
import DateRangePicker from "./DateRangePicker.vue";

const { t, locale } = useI18n();
const router = useRouter();

// Force un format 24h (lang="fr-FR"/"en-GB") : sur iOS, le widget natif
// affiche sinon un format AM/PM basé sur la locale de l'appareil, plus
// large, qui déborde du champ sur mobile.
const timeLang = computed(() => (locale.value === "fr" ? "fr-FR" : "en-GB"));

const localLocation = ref(searchStore.location);
const localStartDate = ref(searchStore.startDate);
const localEndDate = ref(searchStore.endDate);
const localStartTime = ref(searchStore.startTime);
const localEndTime = ref(searchStore.endTime);
const searchError = ref("");

function handleSearch() {
  searchError.value = "";
  if (!localStartDate.value || !localEndDate.value) {
    searchError.value = t("booking.selectDatesError");
    return;
  }
  if (localStartDate.value > localEndDate.value) {
    searchError.value = t("searchBanner.dateError");
    return;
  }
  searchStore.location = localLocation.value;
  searchStore.startDate = localStartDate.value;
  searchStore.endDate = localEndDate.value;
  searchStore.startTime = localStartTime.value;
  searchStore.endTime = localEndTime.value;
  router.push("/fleet");
}
</script>

<style scoped>
.booking-widget {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  max-width: 700px;
  width: 100%;
}
.widget-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 1.5rem;
  text-align: center;
}
.widget-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.field-group {
  display: flex;
  gap: 1rem;
}
@media (max-width: 520px) {
  .field-group {
    flex-direction: column;
  }
}
label,
.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
label svg,
.field-label svg {
  width: 14px;
  height: 14px;
  stroke: #e63946;
  flex-shrink: 0;
}

.location-select {
  padding: 0.6rem 0.8rem;
  background: #f0f4ff;
  border: 1.5px solid #e8ecf5;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}
.location-pin {
  width: 14px;
  height: 14px;
  stroke: #e63946;
  flex-shrink: 0;
}
input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  border-color: var(--color-primary);
}
input[type="time"] {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  background: #fff;
}
input[type="time"]::-webkit-datetime-edit,
input[type="time"]::-webkit-datetime-edit-fields-wrapper,
input[type="time"]::-webkit-datetime-edit-text,
input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field,
input[type="time"]::-webkit-datetime-edit-ampm-field {
  padding: 0;
}
.btn-search {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.search-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
.btn-search:hover {
  background: var(--color-primary-dark);
}
.search-error {
  color: #c62828;
  font-size: 0.84rem;
  font-weight: 600;
  background: #fce4ec;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  margin: 0;
}
.field--error :deep(.drp-input) {
  border-color: #c62828 !important;
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1) !important;
}
</style>
