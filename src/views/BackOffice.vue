<template>
  <div class="backoffice">
    <div class="container">
      <h1 class="page-title">🔧 Back-office — AutoLoc</h1>

      <!-- Onglets -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'vehicles' }]"
          @click="activeTab = 'vehicles'"
        >
          🚗 Véhicules
        </button>
        <button
          :class="['tab', { active: activeTab === 'reservations' }]"
          @click="activeTab = 'reservations'"
        >
          📋 Réservations
          <span v-if="pendingCount" class="tab-badge">{{ pendingCount }}</span>
        </button>
      </div>

      <!-- ════════════ TAB VÉHICULES ════════════ -->
      <div v-if="activeTab === 'vehicles'">
        <section class="form-section">
          <h2>
            {{ editingId ? "Modifier le véhicule" : "Ajouter un véhicule" }}
          </h2>
          <form class="vehicle-form" @submit.prevent="handleSubmit">
            <!-- Upload Photo -->
            <div class="field">
              <label>Photo du véhicule</label>
              <div class="file-drop" @click="fileInput.click()">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  hidden
                />
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  alt="Aperçu"
                  class="photo-preview-img"
                />
                <div v-else class="file-placeholder">
                  <span>📸</span><span>Cliquer pour ajouter une photo</span>
                </div>
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="marque">Marque</label>
                <input
                  id="marque"
                  v-model="form.marque"
                  type="text"
                  placeholder="Ex: Renault, BMW..."
                  required
                />
              </div>
              <div class="field">
                <label for="modele">Modèle</label>
                <input
                  id="modele"
                  v-model="form.modele"
                  type="text"
                  placeholder="Ex: Clio, Série 3..."
                  required
                />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="carburant">Type de carburant</label>
                <select id="carburant" v-model="form.carburant" required>
                  <option value="" disabled>Sélectionner...</option>
                  <option>Essence</option>
                  <option>Diesel</option>
                  <option>Électrique</option>
                  <option>Hybride</option>
                  <option>Hybride rechargeable</option>
                  <option>GPL</option>
                </select>
              </div>
              <div class="field">
                <label for="places">Nombre de places</label>
                <input
                  id="places"
                  v-model.number="form.places"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Ex: 5"
                  required
                />
              </div>
              <div class="field">
                <label for="prix">Prix par jour (€)</label>
                <input
                  id="prix"
                  v-model.number="form.prix"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 45"
                  required
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn-cancel"
                v-if="editingId"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button type="submit" class="btn-submit" :disabled="saving">
                <span v-if="saving">⏳ Enregistrement...</span>
                <span v-else-if="editingId">💾 Sauvegarder</span>
                <span v-else>➕ Ajouter le véhicule</span>
              </button>
            </div>
          </form>
        </section>

        <section class="list-section">
          <h2>
            Véhicules enregistrés
            <span class="badge">{{ vehicles.length }}</span>
          </h2>
          <div v-if="vehicleStore.loading" class="empty-state">
            Chargement depuis Firebase...
          </div>
          <div v-else-if="vehicles.length === 0" class="empty-state">
            Aucun véhicule. Ajoutez-en un ci-dessus.
          </div>
          <div class="vehicles-table-wrapper" v-else>
            <table class="vehicles-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Marque / Modèle</th>
                  <th>Carburant</th>
                  <th>Places</th>
                  <th>Prix/jour</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in vehicles" :key="v.id">
                  <td>
                    <img
                      :src="v.photoURL"
                      :alt="`${v.marque} ${v.modele}`"
                      class="table-thumb"
                    />
                  </td>
                  <td>
                    <strong>{{ v.marque }}</strong>
                    <br /><span class="model-label">{{ v.modele }}</span>
                  </td>
                  <td>
                    <span class="tag" :class="fuelClass(v.carburant)">{{
                      v.carburant
                    }}</span>
                  </td>
                  <td>👥 {{ v.places }}</td>
                  <td>
                    <strong>{{ v.prix ?? "—" }}€</strong>
                  </td>
                  <td>
                    <button
                      :class="[
                        'btn-toggle',
                        v.disponible ? 'btn-toggle--on' : 'btn-toggle--off',
                      ]"
                      @click="vehicleStore.toggleDisponible(v.id, v.disponible)"
                    >
                      {{ v.disponible ? "✅ Disponible" : "🔴 Indisponible" }}
                    </button>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" @click="editVehicle(v)">
                      ✏️ Modifier
                    </button>
                    <button class="btn-delete" @click="deleteVehicle(v.id)">
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- ════════════ TAB RÉSERVATIONS ════════════ -->
      <div v-else>
        <!-- Toggle liste / calendrier -->
        <div class="view-toggle">
          <button
            :class="['vt-btn', { active: reservationsView === 'list' }]"
            @click="reservationsView = 'list'"
          >
            ☰ Liste
          </button>
          <button
            :class="['vt-btn', { active: reservationsView === 'calendar' }]"
            @click="reservationsView = 'calendar'"
          >
            📅 Calendrier
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ reservations.length }}</span
            ><span class="stat-label">Total</span>
          </div>
          <div class="stat-card stat-card--yellow">
            <span class="stat-num">{{ pendingCount }}</span
            ><span class="stat-label">En attente</span>
          </div>
          <div class="stat-card stat-card--blue">
            <span class="stat-num">{{ paidCount }}</span
            ><span class="stat-label">Payées</span>
          </div>
          <div class="stat-card stat-card--green">
            <span class="stat-num">{{ confirmedCount }}</span
            ><span class="stat-label">Confirmées</span>
          </div>
          <div class="stat-card stat-card--red">
            <span class="stat-num">{{ cancelledCount }}</span
            ><span class="stat-label">Annulées</span>
          </div>
        </div>

        <section class="list-section" v-if="reservationsView === 'list'">
          <h2>
            Réservations <span class="badge">{{ reservations.length }}</span>
          </h2>
          <div v-if="reservationStore.loading" class="empty-state">
            Chargement depuis Firebase...
          </div>
          <div v-else-if="reservations.length === 0" class="empty-state">
            Aucune réservation pour le moment.
          </div>
          <div class="vehicles-table-wrapper" v-else>
            <table class="vehicles-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Lieu / Période</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in reservations"
                  :key="r.id"
                  :class="`row--${r.statut}`"
                >
                  <td class="date-col">{{ formatDate(r.createdAt) }}</td>
                  <td>
                    <strong>{{ r.nom }}</strong
                    ><br />
                    <a :href="`mailto:${r.email}`" class="client-email">{{
                      r.email
                    }}</a
                    ><br />
                    <span class="client-phone">{{ r.telephone }}</span>
                  </td>
                  <td>{{ r.vehicleLabel }}</td>
                  <td>
                    <span class="location-label">📍 {{ r.location }}</span
                    ><br />
                    <span class="date-range"
                      >{{ r.startDate }} {{ r.startTime }} → {{ r.endDate }}
                      {{ r.endTime }}</span
                    >
                  </td>
                  <td>
                    <select
                      :value="r.statut"
                      :class="['statut-select', `statut--${r.statut}`]"
                      @change="
                        reservationStore.updateStatut(r.id, $event.target.value)
                      "
                    >
                      <option value="en_attente">⏳ En attente</option>
                      <option value="payee">💳 Payée</option>
                      <option value="confirmee">✅ Confirmée</option>
                      <option value="annulee">❌ Annulée</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Vue calendrier -->
        <div v-if="reservationsView === 'calendar'" class="calendar-wrapper">
          <div class="calendar-legend">
            <span class="legend-dot" style="background: #f59e0b"></span> En
            attente
            <span class="legend-dot" style="background: #3b82f6"></span> Payée
            <span class="legend-dot" style="background: #22c55e"></span>
            Confirmée
            <span class="legend-dot" style="background: #9ca3af"></span> Annulée
          </div>
          <FullCalendar
            :key="calendarEvents.length"
            :options="calendarOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

const activeTab = ref("vehicles");
const vehicles = computed(() => vehicleStore.vehicles);
const reservations = computed(() => reservationStore.reservations);
const pendingCount = computed(
  () => reservations.value.filter((r) => r.statut === "en_attente").length,
);
const paidCount = computed(
  () => reservations.value.filter((r) => r.statut === "payee").length,
);
const confirmedCount = computed(
  () => reservations.value.filter((r) => r.statut === "confirmee").length,
);
const cancelledCount = computed(
  () => reservations.value.filter((r) => r.statut === "annulee").length,
);

// — Formulaire véhicule
const editingId = ref(null);
const saving = ref(false);
const photoFile = ref(null);
const fileInput = ref(null);
const emptyForm = () => ({
  marque: "",
  modele: "",
  carburant: "",
  places: "",
  prix: "",
  photoURL: "",
});
const form = reactive(emptyForm());

const photoPreview = computed(() => {
  if (photoFile.value) return URL.createObjectURL(photoFile.value);
  return form.photoURL || "";
});

function onFileChange(e) {
  photoFile.value = e.target.files[0] || null;
}

async function handleSubmit() {
  saving.value = true;
  try {
    if (editingId.value) {
      await vehicleStore.updateVehicle(
        editingId.value,
        { ...form },
        photoFile.value,
      );
    } else {
      await vehicleStore.addVehicle({ ...form }, photoFile.value);
    }
    cancelEdit();
  } finally {
    saving.value = false;
  }
}

function editVehicle(vehicle) {
  editingId.value = vehicle.id;
  Object.assign(form, {
    marque: vehicle.marque,
    modele: vehicle.modele,
    carburant: vehicle.carburant,
    places: vehicle.places,
    prix: vehicle.prix ?? "",
    photoURL: vehicle.photoURL,
  });
  photoFile.value = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  photoFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

async function deleteVehicle(id) {
  if (confirm("Supprimer ce véhicule définitivement ?")) {
    await vehicleStore.deleteVehicle(id);
    if (editingId.value === id) cancelEdit();
  }
}

function fuelClass(carburant) {
  const map = {
    Essence: "tag--orange",
    Diesel: "tag--gray",
    Électrique: "tag--green",
    Hybride: "tag--blue",
    "Hybride rechargeable": "tag--blue",
    GPL: "tag--purple",
  };
  return map[carburant] || "";
}

function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// — Calendrier
const reservationsView = ref("list");
const STATUS_COLORS = {
  en_attente: "#f59e0b",
  payee: "#3b82f6",
  confirmee: "#22c55e",
  annulee: "#9ca3af",
};
function addOneDay(d) {
  if (!d) return d;
  const dt = new Date(d);
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().split("T")[0];
}
const calendarEvents = computed(() =>
  reservationStore.reservations
    .filter((r) => r.startDate && r.endDate)
    .map((r) => ({
      title: `${r.vehicleLabel} — ${r.nom}`,
      start: r.startDate,
      end: addOneDay(r.endDate),
      backgroundColor: STATUS_COLORS[r.statut] ?? "#888",
      borderColor: STATUS_COLORS[r.statut] ?? "#888",
    })),
);
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  locale: frLocale,
  events: calendarEvents.value,
  eventDisplay: "block",
  height: "auto",
  headerToolbar: { left: "prev,next today", center: "title", right: "" },
}));
</script>

<style scoped>
.backoffice {
  padding: 3rem 0 5rem;
  background: #f8f9ff;
  min-height: 100vh;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e8eaf6;
  padding-bottom: 0;
}
.tab {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.2s;
}
.tab.active {
  color: #1a1a2e;
  border-bottom-color: #e63946;
}
.tab-badge {
  background: #e63946;
  color: #fff;
  border-radius: 20px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.2rem 1.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  flex: 1;
}
.stat-card--yellow {
  border-top: 3px solid #f9a825;
}
.stat-card--blue {
  border-top: 3px solid #3b82f6;
}
.stat-card--green {
  border-top: 3px solid #2e7d32;
}
.stat-card--red {
  border-top: 3px solid #c62828;
}
.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
}
.stat-label {
  font-size: 0.85rem;
  color: #888;
}

/* Form */
.form-section {
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  margin-bottom: 2.5rem;
}
.form-section h2 {
  font-size: 1.2rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.field-row {
  display: flex;
  gap: 1rem;
}
@media (max-width: 560px) {
  .field-row {
    flex-direction: column;
  }
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
input,
select {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
}
input:focus,
select:focus {
  border-color: #e63946;
}

/* Photo Upload */
.file-drop {
  border: 2px dashed #d0d4e8;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.file-drop:hover {
  border-color: #e63946;
}
.file-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
  padding: 2rem;
}
.file-placeholder span:first-child {
  font-size: 2rem;
}
.photo-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.btn-submit {
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover:not(:disabled) {
  background: #2d2d4e;
}
.btn-submit:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
}

/* List */
.list-section {
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}
.list-section h2 {
  font-size: 1.2rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.badge {
  background: #e63946;
  color: #fff;
  border-radius: 20px;
  padding: 0.1rem 0.6rem;
  font-size: 0.85rem;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}
.vehicles-table-wrapper {
  overflow-x: auto;
}
.vehicles-table {
  width: 100%;
  border-collapse: collapse;
}
.vehicles-table th {
  text-align: left;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
  color: #888;
  background: #f8f9ff;
  border-bottom: 1px solid #eee;
}
.vehicles-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.table-thumb {
  width: 80px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
}
.model-label {
  font-size: 0.82rem;
  color: #888;
}

/* Tags */
.tag {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.tag--orange {
  background: #fff3e0;
  color: #e65100;
}
.tag--gray {
  background: #f5f5f5;
  color: #424242;
}
.tag--green {
  background: #e8f5e9;
  color: #2e7d32;
}
.tag--blue {
  background: #e3f2fd;
  color: #1565c0;
}
.tag--purple {
  background: #f3e5f5;
  color: #6a1b9a;
}

/* Disponible toggle */
.btn-toggle {
  border: none;
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.btn-toggle--on {
  background: #e8f5e9;
  color: #2e7d32;
}
.btn-toggle--off {
  background: #fce4ec;
  color: #c62828;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}
.btn-edit,
.btn-delete {
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}
.btn-edit {
  background: #e3f2fd;
  color: #1565c0;
}
.btn-edit:hover {
  background: #bbdefb;
}
.btn-delete {
  background: #fce4ec;
  color: #c62828;
}
.btn-delete:hover {
  background: #f8bbd0;
}

/* Reservations */
.date-col {
  font-size: 0.85rem;
  color: #888;
  white-space: nowrap;
}
.client-email {
  font-size: 0.82rem;
  color: #1565c0;
  text-decoration: none;
}
.client-phone {
  font-size: 0.82rem;
  color: #888;
}
.location-label {
  font-size: 0.82rem;
  font-weight: 600;
}
.date-range {
  font-size: 0.78rem;
  color: #888;
}
.row--confirmee {
  background: #f1f8f1;
}
.row--annulee {
  background: #fff5f5;
  opacity: 0.7;
}

.statut-select {
  border: none;
  border-radius: 20px;
  padding: 0.3rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}
.statut--en_attente {
  background: #fff8e1;
  color: #f57f17;
}
.statut--confirmee {
  background: #e8f5e9;
  color: #2e7d32;
}
.statut--annulee {
  background: #fce4ec;
  color: #c62828;
}
.statut--payee {
  background: #dbeafe;
  color: #1d4ed8;
}

/* Vue toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.vt-btn {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.45rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}
.vt-btn.active {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}

/* Calendrier */
.calendar-wrapper {
  background: #fff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
}
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.3rem;
}
</style>
