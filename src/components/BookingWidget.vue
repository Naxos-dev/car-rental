<template>
  <div class="booking-widget">
    <h3 class="widget-title">Réservez votre véhicule</h3>
    <form class="widget-form" @submit.prevent="handleSearch">
      <!-- Localisation -->
      <div class="field">
        <label for="location">📍 Lieu de prise en charge</label>
        <input id="location" value="Lille" type="text" readonly />
      </div>

      <!-- Début de réservation -->
      <div class="field-group">
        <div class="field">
          <label for="startDate">📅 Date de début</label>
          <input
            id="startDate"
            v-model="searchStore.startDate"
            type="date"
            :min="today"
            required
          />
        </div>
        <div class="field">
          <label for="startTime">⏰ Heure de début</label>
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
          <label for="endDate">📅 Date de fin</label>
          <input
            id="endDate"
            v-model="searchStore.endDate"
            type="date"
            :min="searchStore.startDate || today"
            required
          />
        </div>
        <div class="field">
          <label for="endTime">⏰ Heure de fin</label>
          <input
            id="endTime"
            v-model="searchStore.endTime"
            type="time"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-search">
        Voir les véhicules disponibles ↓
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { searchStore } from "../store/search.js";

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
