<template>
  <div class="search-banner-wrapper">
    <!-- Bandeau résumé -->
    <div class="search-banner" @click="toggleEdit">
      <div class="banner-info">
        <span class="banner-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="banner-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ searchStore.location }}</span>
        <span class="banner-dates">
          {{ fmtDate(searchStore.startDate) }}
          <span class="sep" aria-hidden="true">|</span>
          {{ searchStore.startTime }}
          <span class="sep" aria-hidden="true">–</span>
          {{ fmtDate(searchStore.endDate) }}
          <span class="sep" aria-hidden="true">|</span>
          {{ searchStore.endTime }}
        </span>
      </div>
      <button
        class="btn-edit"
        @click.stop="toggleEdit"
        :aria-label="editOpen ? t('searchBanner.close') : t('searchBanner.editSearch')"
      >
        <svg
          v-if="!editOpen"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>

    <!-- Panneau glissant -->
    <transition name="slide-down">
      <div v-if="editOpen" class="edit-panel" aria-live="polite" :aria-label="t('searchBanner.editSearch')">
        <form class="edit-form" @submit.prevent="applyChanges">
          <!-- Lieu -->
          <div class="edit-field edit-field--full">
            <label for="sb-location">{{ t("searchBanner.location") }}</label>
            <select id="sb-location" v-model="draft.location">
              <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.nom">{{ loc.nom }}</option>
            </select>
          </div>

          <!-- Période -->
          <div class="edit-field edit-field--full">
            <label>{{ t("searchBanner.dateRange") }}</label>
            <DateRangePicker
              :startDate="draft.startDate"
              :endDate="draft.endDate"
              :disabledRanges="[]"
              :placeholder="t('searchBanner.selectDates')"
              @update:startDate="draft.startDate = $event"
              @update:endDate="draft.endDate = $event"
            />
          </div>

          <!-- Heures -->
          <div class="edit-row">
            <div class="edit-field">
              <label for="sb-startTime">{{ t("searchBanner.startTime") }}</label>
              <input id="sb-startTime" v-model="draft.startTime" type="time" required :lang="timeLang" />
            </div>
            <div class="edit-field">
              <label for="sb-endTime">{{ t("searchBanner.endTime") }}</label>
              <input id="sb-endTime" v-model="draft.endTime" type="time" required :lang="timeLang" />
            </div>
          </div>
          <p v-if="dateError" ref="dateErrorRef" class="date-error" role="alert">{{ dateError }}</p>
          <div class="edit-actions">
            <button type="button" class="btn-cancel" @click="editOpen = false">
              {{ t("searchBanner.cancel") }}
            </button>
            <button type="submit" class="btn-apply">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="apply-icon" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ t("searchBanner.update") }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";
import { locationStore } from "../store/locations.js";
import DateRangePicker from "./DateRangePicker.vue";
import { formatDate } from "../composables/useFormatDate.js";

const { t, locale } = useI18n();
const editOpen = ref(false);

// Force un format 24h (lang="fr-FR"/"en-GB") : sur iOS, le widget natif
// affiche sinon un format AM/PM basé sur la locale de l'appareil, plus
// large, qui déborde du champ sur mobile.
const timeLang = computed(() => (locale.value === "fr" ? "fr-FR" : "en-GB"));
const dateError = ref("");

const draft = reactive({
  location: searchStore.location,
  startDate: searchStore.startDate,
  startTime: searchStore.startTime,
  endDate: searchStore.endDate,
  endTime: searchStore.endTime,
});

function toggleEdit() {
  if (!editOpen.value) {
    draft.location = searchStore.location;
    draft.startDate = searchStore.startDate;
    draft.startTime = searchStore.startTime;
    draft.endDate = searchStore.endDate;
    draft.endTime = searchStore.endTime;
    dateError.value = "";
  }
  editOpen.value = !editOpen.value;
}

const dateErrorRef = ref(null);

function applyChanges() {
  dateError.value = "";
  if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
    dateError.value = t("searchBanner.dateError");
    nextTick(() => dateErrorRef.value?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    return;
  }
  searchStore.location = draft.location;
  searchStore.startDate = draft.startDate;
  searchStore.startTime = draft.startTime;
  searchStore.endDate = draft.endDate;
  searchStore.endTime = draft.endTime;
  editOpen.value = false;
}

function fmtDate(dateStr) {
  return formatDate(dateStr, { day: "numeric", month: "short", year: "numeric" });
}
</script>

<style scoped>
.search-banner-wrapper {
  background: var(--color-navy);
}

.search-banner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.banner-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.banner-location {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.banner-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.banner-dates {
  color: #aab4d4;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.sep {
  opacity: 0.5;
}

.btn-edit {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Panneau d'édition */
.edit-panel {
  background: #fff;
  border-top: 1px solid #e8eaf6;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.edit-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-row {
  display: flex;
  gap: 1rem;
}

@media (max-width: 520px) {
  .edit-row {
    flex-direction: column;
  }
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.edit-field--full {
  flex: none;
  width: 100%;
}
.edit-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}

.edit-field input,
.edit-field select {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;
}

.edit-field input:focus,
.edit-field select:focus {
  border-color: var(--color-primary);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  background: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.2rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-apply {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.apply-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.btn-apply:hover {
  background: var(--color-primary-dark);
}

.date-error {
  color: #c62828;
  font-size: 0.84rem;
  font-weight: 600;
  background: #fce4ec;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  margin: 0;
}

/* Animation glissante */
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.3s ease;
  overflow: hidden;
  max-height: 520px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
