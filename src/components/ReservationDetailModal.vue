<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="modal-header">
          <h3>Détails de la réservation</h3>
          <span :class="['statut-badge', `statut--${reservation.statut}`]">
            {{ statutLabel }}
          </span>
        </div>

        <!-- Véhicule -->
        <div class="section">
          <div class="section-label">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="section-icon"
            >
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            Véhicule
          </div>
          <div class="vehicle-summary">
            <img
              v-if="reservation.vehiclePhoto"
              :src="reservation.vehiclePhoto"
              :alt="reservation.vehicleLabel"
              class="vehicle-thumb"
            />
            <div class="vehicle-summary-info">
              <strong>{{ reservation.vehicleLabel }}</strong>
            </div>
          </div>
        </div>

        <!-- Dates et lieu -->
        <div class="section">
          <div class="section-label">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="section-icon"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Dates et lieu
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Lieu</span>
              <span class="info-value">{{ reservation.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Du</span>
              <span class="info-value"
                >{{ reservation.startDate }} {{ reservation.startTime }}</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">Au</span>
              <span class="info-value"
                >{{ reservation.endDate }} {{ reservation.endTime }}</span
              >
            </div>
          </div>
        </div>

        <!-- Client -->
        <div class="section">
          <div class="section-label">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="section-icon"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Client
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nom</span>
              <span class="info-value">{{ reservation.nom }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <a :href="`mailto:${reservation.email}`" class="info-link">{{
                reservation.email
              }}</a>
            </div>
            <div class="info-item">
              <span class="info-label">Téléphone</span>
              <span class="info-value">{{ reservation.telephone || "—" }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div v-if="confirmDelete" class="confirm-delete">
            <span>Confirmer la suppression ?</span>
            <button class="btn-confirm-delete" @click="handleDelete">Oui, supprimer</button>
            <button class="btn-cancel-delete" @click="confirmDelete = false">Annuler</button>
          </div>
          <template v-else>
            <button class="btn-delete" @click="confirmDelete = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Supprimer
            </button>
            <button class="btn-close" @click="$emit('close')">Fermer</button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  reservation: { type: Object, required: true },
  visible: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "delete"]);

const confirmDelete = ref(false);

watch(() => props.visible, (v) => { if (!v) confirmDelete.value = false; });

const statutLabel = computed(() => {
  const map = { confirmee: "Confirmée", annulee: "Annulée" };
  return map[props.reservation.statut] ?? props.reservation.statut;
});

function handleDelete() {
  emit("delete", props.reservation.id);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 30, 0.6);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}
.modal-card {
  background: #fff;
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.modal-close:hover {
  background: #e0e0e0;
}
.modal-close svg {
  width: 16px;
  height: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #1a1a2e;
}
.statut-badge {
  border-radius: 20px;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}
.statut--confirmee {
  background: #e8f5e9;
  color: #2e7d32;
}
.statut--annulee {
  background: #fce4ec;
  color: #c62828;
}

.section {
  margin-bottom: 1.2rem;
}
.section-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.section-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.vehicle-summary {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  background: #f8f9ff;
  border-radius: 10px;
  padding: 0.75rem;
}
.vehicle-thumb {
  width: 80px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.vehicle-summary-info {
  font-size: 0.95rem;
  color: #1a1a2e;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.info-item {
  display: flex;
  gap: 0.8rem;
  align-items: baseline;
}
.info-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #888;
  min-width: 80px;
  flex-shrink: 0;
}
.info-value {
  font-size: 0.9rem;
  color: #1a1a2e;
}
.info-link {
  font-size: 0.9rem;
  color: #1565c0;
  text-decoration: none;
}
.info-link:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.btn-close {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.btn-close:hover {
  background: #e0e0e0;
}
.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.btn-delete {
  background: #fce4ec;
  color: #c62828;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-right: auto;
}
.btn-delete:hover {
  background: #ef9a9a;
}
.confirm-delete {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  flex-wrap: wrap;
}
.confirm-delete span {
  font-size: 0.88rem;
  color: #c62828;
  font-weight: 600;
  margin-right: auto;
}
.btn-confirm-delete {
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm-delete:hover {
  background: #b71c1c;
}
.btn-cancel-delete {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel-delete:hover {
  background: #e0e0e0;
}

@media (max-width: 480px) {
  .modal-card {
    padding: 1.25rem 1rem;
    border-radius: 14px;
  }
  .modal-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
