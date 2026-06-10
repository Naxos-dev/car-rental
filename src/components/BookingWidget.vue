<template>
  <div class="booking-widget">
    <h3 class="widget-title">{{ t("booking.title") }}</h3>
    <form class="widget-form" @submit.prevent="handleSearch">
      <!-- Localisation -->
      <div class="field">
        <label for="location">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ t("booking.location") }}
        </label>
        <input id="location" value="Lille" type="text" readonly />
      </div>

      <!-- Début de réservation -->
      <div class="field-group">
        <div class="field">
          <label for="startDate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ t("booking.startDate") }}
          </label>
          <input
            id="startDate"
            v-model="searchStore.startDate"
            type="date"
            :min="today"
            required
          />
        </div>
        <div class="field">
          <label for="startTime">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {{ t("booking.startTime") }}
          </label>
          <input
            id="startTime"
            v-model="searchStore.startTime"
            type="time"
            required
          />
        </div>
      </div>

      <!-- Fin de réservation -->
      <div class="field-group">
        <div class="field">
          <label for="endDate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ t("booking.endDate") }}
          </label>
          <input
            id="endDate"
            v-model="searchStore.endDate"
            type="date"
            :min="searchStore.startDate || today"
            required
          />
        </div>
        <div class="field">
          <label for="endTime">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {{ t("booking.endTime") }}
          </label>
          <input
            id="endTime"
            v-model="searchStore.endTime"
            type="time"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-search">
        {{ t("booking.search") }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";

const { t } = useI18n();
const router = useRouter();
const today = computed(() => new Date().toISOString().split("T")[0]);

function handleSearch() {
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
  color: #1a1a2e;
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
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
label svg {
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
  border-color: #e63946;
}
input[readonly] {
  background: #f0f0f0;
  color: #888;
  cursor: not-allowed;
}
.btn-search {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
.btn-search:hover {
  background: #c1121f;
}
</style>
