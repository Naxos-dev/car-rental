<template>
  <div class="search-banner-wrapper">
    <!-- Bandeau résumé -->
    <div class="search-banner" @click="toggleEdit">
      <div class="banner-info">
        <span class="banner-location"
          >📍 {{ searchStore.location || "Lille" }}</span
        >
        <span class="banner-dates">
          {{ formatDate(searchStore.startDate) }}
          <span class="sep">|</span>
          {{ searchStore.startTime }}
          <span class="sep">–</span>
          {{ formatDate(searchStore.endDate) }}
          <span class="sep">|</span>
          {{ searchStore.endTime }}
        </span>
      </div>
      <button
        class="btn-edit"
        @click.stop="toggleEdit"
        :aria-label="editOpen ? 'Fermer' : 'Modifier'"
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
      <div v-if="editOpen" class="edit-panel">
        <form class="edit-form" @submit.prevent="applyChanges">
          <div class="edit-row">
            <div class="edit-field">
              <label>{{ t('searchBanner.startDate') }}</label>
              <input
                v-model="draft.startDate"
                type="date"
                :min="today"
                required
              />
            </div>
            <div class="edit-field">
              <label>{{ t('searchBanner.startTime') }}</label>
              <input v-model="draft.startTime" type="time" required />
            </div>
          </div>
          <div class="edit-row">
            <div class="edit-field">
              <label>{{ t('searchBanner.endDate') }}</label>
              <input
                v-model="draft.endDate"
                type="date"
                :min="draft.startDate || today"
                required
              />
            </div>
            <div class="edit-field">
              <label>{{ t('searchBanner.endTime') }}</label>
              <input v-model="draft.endTime" type="time" required />
            </div>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn-cancel" @click="editOpen = false">
              {{ t('searchBanner.cancel') }}
            </button>
            <button type="submit" class="btn-apply">{{ t('searchBanner.update') }}</button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";

const { t } = useI18n();
const editOpen = ref(false);

const today = computed(() => new Date().toISOString().split("T")[0]);

const draft = reactive({
  startDate: searchStore.startDate,
  startTime: searchStore.startTime,
  endDate: searchStore.endDate,
  endTime: searchStore.endTime,
});

function toggleEdit() {
  if (!editOpen.value) {
    draft.startDate = searchStore.startDate;
    draft.startTime = searchStore.startTime;
    draft.endDate = searchStore.endDate;
    draft.endTime = searchStore.endTime;
  }
  editOpen.value = !editOpen.value;
}

function applyChanges() {
  searchStore.startDate = draft.startDate;
  searchStore.startTime = draft.startTime;
  searchStore.endDate = draft.endDate;
  searchStore.endTime = draft.endTime;
  editOpen.value = false;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
</script>

<style scoped>
.search-banner-wrapper {
  background: #1a1a2e;
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
  width: 32px;
  height: 32px;
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

.edit-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}

.edit-field input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;
}

.edit-field input:focus {
  border-color: #e63946;
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
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-apply:hover {
  background: #c1121f;
}

/* Animation glissante */
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
  max-height: 300px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
