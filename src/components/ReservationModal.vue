<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <button
          class="modal-close"
          @click="$emit('close')"
          :aria-label="t('modal.close')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
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
              <span class="tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon">
                  <path d="M3 22V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/>
                  <path d="M3 22h10"/>
                  <path d="M13 7h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V8l-3-3"/>
                  <rect x="5" y="10" width="6" height="5" rx="1"/>
                </svg>
                {{ vehicle.carburant }}
              </span>
              <span class="tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {{ vehicle.places }} places
              </span>
            </div>
          </div>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Détails de réservation -->
          <div class="section-label">{{ t("modal.reservationDetails") }}</div>

          <div class="field">
            <label>{{ t("modal.location") }}</label>
            <input value="Lille" type="text" readonly />
          </div>
          <div class="field-row">
            <div class="field">
              <label>{{ t("modal.startDate") }}</label>
              <input
                v-model="searchStore.startDate"
                type="date"
                :min="today"
                required
              />
            </div>
            <div class="field">
              <label>{{ t("modal.startTime") }}</label>
              <input v-model="searchStore.startTime" type="time" required />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>{{ t("modal.endDate") }}</label>
              <input
                v-model="searchStore.endDate"
                type="date"
                :min="searchStore.startDate || today"
                required
              />
            </div>
            <div class="field">
              <label>{{ t("modal.endTime") }}</label>
              <input v-model="searchStore.endTime" type="time" required />
            </div>
          </div>

          <!-- Informations client -->
          <div class="section-label">{{ t("modal.clientInfo") }}</div>

          <div class="field-row">
            <div class="field">
              <label>{{ t("modal.firstName") }}</label>
              <input
                v-model="customerForm.prenom"
                type="text"
                :placeholder="t('modal.firstNamePlaceholder')"
                required
              />
            </div>
            <div class="field">
              <label>{{ t("modal.lastName") }}</label>
              <input
                v-model="customerForm.nom"
                type="text"
                :placeholder="t('modal.lastNamePlaceholder')"
                required
              />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>{{ t("modal.email") }}</label>
              <input
                v-model="customerForm.email"
                type="email"
                :placeholder="t('modal.emailPlaceholder')"
                required
              />
            </div>
            <div class="field">
              <label>{{ t("modal.phone") }}</label>
              <input
                v-model="customerForm.telephone"
                type="tel"
                :placeholder="t('modal.phonePlaceholder')"
              />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="msg-icon">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ errorMsg }}
          </p>

          <div v-if="success" class="success-msg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="msg-icon">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Réservation enregistrée ! Un admin vous contactera pour confirmer.
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              {{ t("searchBanner.cancel") }}
            </button>
            <button type="submit" class="btn-confirm">
              {{ t("modal.proceed") }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
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
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";
import { checkoutStore } from "../store/checkout.js";
import { userAuthStore } from "../store/userAuth.js";

const { t } = useI18n();

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
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.tag-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.success-msg {
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.msg-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.btn-arrow {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
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
