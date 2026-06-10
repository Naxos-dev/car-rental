<template>
  <div class="backoffice">
    <div class="container">
      <h1 class="page-title">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
        Back-office — AutoLoc
      </h1>

      <!-- Onglets -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'vehicles' }]"
          @click="activeTab = 'vehicles'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"
            />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          Véhicules
        </button>
        <button
          :class="['tab', { active: activeTab === 'reservations' }]"
          @click="activeTab = 'reservations'"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path
              d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            />
          </svg>
          Réservations
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span>Cliquer pour ajouter une photo</span>
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
                <svg
                  v-if="saving"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="icon-spin"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <svg
                  v-else-if="editingId"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span v-if="saving">Enregistrement...</span>
                <span v-else-if="editingId">Sauvegarder</span>
                <span v-else>Ajouter le véhicule</span>
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
                  <td class="td-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="inline-icon"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {{ v.places }}
                  </td>
                  <td>
                    <strong>{{ v.prix ?? "—" }}€</strong>
                  </td>
                  <td class="td-center">
                    <button
                      :class="[
                        'btn-toggle',
                        v.disponible ? 'btn-toggle--on' : 'btn-toggle--off',
                      ]"
                      @click="vehicleStore.toggleDisponible(v.id, v.disponible)"
                    >
                      <svg
                        v-if="v.disponible"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <svg
                        v-else
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {{ v.disponible ? "Disponible" : "Indisponible" }}
                    </button>
                  </td>
                  <td class="actions td-center">
                    <button class="btn-edit" @click="editVehicle(v)">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                      Modifier
                    </button>
                    <button class="btn-delete" @click="deleteVehicle(v.id)">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path
                          d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                        />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      Supprimer
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline-icon"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Liste
          </button>
          <button
            :class="['vt-btn', { active: reservationsView === 'calendar' }]"
            @click="reservationsView = 'calendar'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline-icon"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendrier
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ reservations.length }}</span
            ><span class="stat-label">Total</span>
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
                  <th class="th-center">Détail</th>
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
                    <span class="location-label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {{ r.location }}</span
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
                      <option value="confirmee">Confirmée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </td>
                  <td class="td-center">
                    <button
                      class="btn-detail"
                      @click="openDetail(r)"
                      title="Voir les détails"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Vue calendrier -->
        <div v-if="reservationsView === 'calendar'" class="calendar-wrapper">
          <div class="calendar-legend">
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

    <ReservationDetailModal
      v-if="detailReservation"
      :reservation="detailReservation"
      :visible="showDetailModal"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import ReservationDetailModal from "../components/ReservationDetailModal.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

const activeTab = ref("vehicles");
const vehicles = computed(() => vehicleStore.vehicles);
const reservations = computed(() => reservationStore.reservations);
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
const detailReservation = ref(null);
const showDetailModal = ref(false);

function openDetail(r) {
  detailReservation.value = r;
  showDetailModal.value = true;
}
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-title svg {
  width: 28px;
  height: 28px;
  color: #e63946;
  flex-shrink: 0;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
.tab svg,
.vt-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
.file-placeholder svg {
  width: 40px;
  height: 40px;
  color: #aaa;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) {
  background: #2d2d4e;
}
.btn-submit svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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
.inline-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  vertical-align: middle;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.icon-spin {
  animation: spin 1s linear infinite;
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
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.btn-toggle--on {
  background: #e8f5e9;
  color: #2e7d32;
}
.btn-toggle--off {
  background: #fce4ec;
  color: #c62828;
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
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
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
.th-center {
  text-align: center;
}
.td-center {
  text-align: center;
}
.btn-detail {
  background: #e8eaf6;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-detail:hover {
  background: #c5c9e8;
}
.btn-detail svg {
  width: 16px;
  height: 16px;
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
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
