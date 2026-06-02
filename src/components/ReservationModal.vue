<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
          ✕
        </button>

        <!-- Résumé véhicule -->
        <div class="vehicle-summary">
          <img
            :src="vehicle.photoURL"
            :alt="`${vehicle.marque} ${vehicle.modele}`"
            class="vehicle-thumb"
          />
          <div class="vehicle-summary-info">
            <h3>{{ vehicle.marque }} {{ vehicle.modele }}</h3>
            <div class="vehicle-tags">
              <span class="tag">⛽ {{ vehicle.carburant }}</span>
              <span class="tag">👥 {{ vehicle.places }} places</span>
            </div>
          </div>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Détails de réservation -->
          <div class="section-label">📅 Détails de la réservation</div>

          <div class="field">
            <label>📍 Lieu de prise en charge</label>
            <input value="Lille" type="text" readonly />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Date de début</label>
              <input
                v-model="searchStore.startDate"
                type="date"
                :min="today"
                required
              />
            </div>
            <div class="field">
              <label>Heure de début</label>
              <input v-model="searchStore.startTime" type="time" required />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Date de fin</label>
              <input
                v-model="searchStore.endDate"
                type="date"
                :min="searchStore.startDate || today"
                required
              />
            </div>
            <div class="field">
              <label>Heure de fin</label>
              <input v-model="searchStore.endTime" type="time" required />
            </div>
          </div>

          <!-- Informations client -->
          <div class="section-label">👤 Vos informations</div>

          <div class="field-row">
            <div class="field">
              <label>Prénom *</label>
              <input
                v-model="customerForm.prenom"
                type="text"
                placeholder="Jean"
                required
              />
            </div>
            <div class="field">
              <label>Nom *</label>
              <input
                v-model="customerForm.nom"
                type="text"
                placeholder="Dupont"
                required
              />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Email *</label>
              <input
                v-model="customerForm.email"
                type="email"
                placeholder="jean@exemple.com"
                required
              />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input
                v-model="customerForm.telephone"
                type="tel"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>

          <div v-if="success" class="success-msg">
            ✅ Réservation enregistrée ! Un admin vous contactera pour
            confirmer.
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-confirm">
              Procéder au paiement →
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { searchStore } from "../store/search.js";
import { checkoutStore } from "../store/checkout.js";
import { userAuthStore } from "../store/userAuth.js";

const props = defineProps({ vehicle: Object, visible: Boolean });
const emit = defineEmits(["close"]);
const router = useRouter();

const today = computed(() => new Date().toISOString().split("T")[0]);
const customerForm = reactive({
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
});
const loading = ref(false);
const success = ref(false);
const errorMsg = ref("");

// Pré-remplir avec le profil connecté à chaque ouverture
watch(
  () => props.visible,
  (val) => {
    if (val) {
      const profile = userAuthStore.userProfile;
      const user = userAuthStore.user;
      Object.assign(customerForm, {
        prenom: profile?.prenom ?? "",
        nom: profile?.nom ?? "",
        email: user?.email ?? "",
        telephone: "",
      });
      errorMsg.value = "";
      success.value = false;
    }
  },
);

async function handleSubmit() {
  errorMsg.value = "";
  if (!searchStore.location || !searchStore.startDate || !searchStore.endDate) {
    errorMsg.value = "Veuillez renseigner le lieu et les dates de réservation.";
    return;
  }
  // Sauvegarder dans le store de checkout
  checkoutStore.vehicle = props.vehicle;
  checkoutStore.nom = `${customerForm.prenom} ${customerForm.nom}`.trim();
  checkoutStore.email = customerForm.email;
  checkoutStore.telephone = customerForm.telephone;
  checkoutStore.location = searchStore.location;
  checkoutStore.startDate = searchStore.startDate;
  checkoutStore.startTime = searchStore.startTime;
  checkoutStore.endDate = searchStore.endDate;
  checkoutStore.endTime = searchStore.endTime;
  emit("close");
  router.push("/checkout");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 30, 0.6);
  z-index: 500;
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
  max-width: 560px;
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
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Vehicle summary */
.vehicle-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: #f8f9ff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.vehicle-thumb {
  width: 100px;
  height: 68px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.vehicle-summary-info h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  color: #1a1a2e;
}
.vehicle-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag {
  background: #e8eaf6;
  color: #1a1a2e;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a2e;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.4rem;
  margin-top: 0.4rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.field-row {
  display: flex;
  gap: 0.8rem;
}
@media (max-width: 480px) {
  .field-row {
    flex-direction: column;
  }
}
label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}
input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  border-color: #e63946;
}
.error-msg {
  background: #fce4ec;
  color: #c62828;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.88rem;
}
.success-msg {
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.modal-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  min-width: 100px;
}
.btn-confirm {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  flex: 2;
  min-width: 140px;
}
.btn-confirm:hover:not(:disabled) {
  background: #c1121f;
}
.btn-confirm:disabled {
  background: #f4a0a6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .modal-card {
    padding: 1.25rem 1rem;
    border-radius: 14px;
  }
  .vehicle-summary {
    flex-direction: column;
  }
  .vehicle-thumb {
    width: 100%;
    height: 140px;
  }
  .modal-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-confirm {
    width: 100%;
    text-align: center;
  }
}
</style>
