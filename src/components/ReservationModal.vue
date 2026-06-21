<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="modalCardRef"
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <p id="modal-desc" class="sr-only">{{ t("modal.description") }}</p>
        <button
          class="modal-close"
          @click="$emit('close')"
          :aria-label="t('modal.close')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="14"
            height="14"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Résumé véhicule -->
        <div class="vehicle-summary">
          <img
            v-if="!imgFailed"
            :src="thumbUrl"
            :alt="`${vehicle.marque} ${vehicle.modele}`"
            class="vehicle-thumb"
            @error="imgFailed = true"
          />
          <div v-else class="vehicle-thumb vehicle-thumb--placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div class="vehicle-summary-info">
            <h3 id="modal-title">{{ vehicle.marque }} {{ vehicle.modele }}</h3>
            <div class="vehicle-tags">
              <span class="tag">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="tag-icon"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                {{ vehicle.carburant in fuelMap ? fuelMap[vehicle.carburant] : vehicle.carburant }}
              </span>
              <span class="tag">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="tag-icon"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {{ vehicle.places }} {{ t("fleet.seats") }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="initialConflict" class="conflict-banner" role="alert">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="msg-icon"
            aria-hidden="true"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {{ t("modal.datesConflictNotice") }}
        </div>

        <!-- Progress steps -->
        <p class="sr-only" aria-live="polite">
          {{ t("modal.stepAnnounce", { n: currentStep }) }}
        </p>
        <div class="modal-steps" aria-hidden="true">
          <div
            :class="[
              'modal-step',
              currentStep >= 1 ? 'modal-step--active' : '',
            ]"
          >
            <span class="step-num">1</span>
            <span class="step-label">{{ t("modal.stepDates") }}</span>
          </div>
          <div class="step-connector"></div>
          <div
            :class="[
              'modal-step',
              currentStep >= 2 ? 'modal-step--active' : '',
            ]"
          >
            <span class="step-num">2</span>
            <span class="step-label">{{ t("modal.stepContact") }}</span>
          </div>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Détails de réservation -->
          <div class="section-label">{{ t("modal.reservationDetails") }}</div>

          <div class="field">
            <label for="modal-location">{{ t("modal.location") }}</label>
            <input id="modal-location" :value="searchStore.location" type="text" readonly />
          </div>

          <div class="field">
            <div class="field-label-row">
              <label id="modal-dates-label">{{ t("modal.dateRange") }}</label>
            </div>
            <DateRangePicker aria-labelledby="modal-dates-label"
              :startDate="localStartDate"
              :endDate="localEndDate"
              :disabledRanges="disabledRanges"
              :placeholder="t('modal.selectDates')"
              @update:startDate="localStartDate = $event"
              @update:endDate="localEndDate = $event"
            />
            <p v-if="isConflict" class="dates-conflict-msg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="msg-icon"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {{ t("modal.vehicleConflict") }}
            </p>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="modal-start-time">{{ t("modal.startTime") }}</label>
              <input id="modal-start-time" v-model="localStartTime" type="time" required aria-required="true" />
            </div>
            <div class="field">
              <label for="modal-end-time">{{ t("modal.endTime") }}</label>
              <input id="modal-end-time" v-model="localEndTime" type="time" required aria-required="true" />
            </div>
          </div>

          <!-- Informations client -->
          <div class="section-label">{{ t("modal.clientInfo") }}</div>
          <p class="required-note">{{ t("form.required") }}</p>

          <div class="field-row">
            <div class="field">
              <label for="modal-prenom">{{ t("modal.firstName") }}</label>
              <input
                id="modal-prenom"
                v-model="customerForm.prenom"
                type="text"
                :placeholder="t('modal.firstNamePlaceholder')"
                :class="{ 'input--error': fieldErrors.prenom }"
                :aria-invalid="fieldErrors.prenom"
                aria-required="true"
                required
                @blur="touched.prenom = true"
              />
              <span v-if="fieldErrors.prenom" class="field-error" role="alert"
                >{{ t("modal.firstName").replace(" *", "") }}
                {{ t("form.required").replace("* ", "") }}</span
              >
            </div>
            <div class="field">
              <label for="modal-nom">{{ t("modal.lastName") }}</label>
              <input
                id="modal-nom"
                v-model="customerForm.nom"
                type="text"
                :placeholder="t('modal.lastNamePlaceholder')"
                :class="{ 'input--error': fieldErrors.nom }"
                :aria-invalid="fieldErrors.nom"
                aria-required="true"
                required
                @blur="touched.nom = true"
              />
              <span v-if="fieldErrors.nom" class="field-error" role="alert"
                >{{ t("modal.lastName").replace(" *", "") }}
                {{ t("form.required").replace("* ", "") }}</span
              >
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="modal-email">{{ t("modal.email") }}</label>
              <input
                id="modal-email"
                v-model="customerForm.email"
                type="email"
                :placeholder="t('modal.emailPlaceholder')"
                :class="{ 'input--error': fieldErrors.email }"
                :aria-invalid="fieldErrors.email"
                aria-required="true"
                required
                @blur="touched.email = true"
              />
              <span v-if="fieldErrors.email" class="field-error" role="alert"
                >{{ t("modal.email").replace(" *", "") }}
                {{ t("form.required").replace("* ", "") }}</span
              >
            </div>
            <div class="field">
              <label for="modal-tel">{{ t("modal.phone") }}</label>
              <input
                id="modal-tel"
                v-model="customerForm.telephone"
                type="tel"
                :placeholder="t('modal.phonePlaceholder')"
              />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="msg-icon"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {{ errorMsg }}
          </p>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              {{ t("searchBanner.cancel") }}
            </button>
            <button
              type="submit"
              class="btn-confirm"
              :disabled="isConflict || loading"
              :aria-busy="loading"
            >
              <svg
                v-if="loading"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="btn-arrow spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <template v-else>
                {{ t("modal.proceed") }}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="btn-arrow"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { searchStore } from "../store/search.js";
import { checkoutStore } from "../store/checkout.js";
import { reservationStore } from "../store/reservations.js";
import { authStore as userAuthStore } from "../store/auth.js";
import DateRangePicker from "./DateRangePicker.vue";
import { cloudinaryThumb } from "../utils/cloudinaryUtils.js";

const { t, tm } = useI18n();
const fuelMap = computed(() => tm('fuel'));

const props = defineProps({ vehicle: Object, visible: Boolean });
const emit = defineEmits(["close"]);
const router = useRouter();

const imgFailed = ref(false);

const thumbUrl = computed(() => cloudinaryThumb(props.vehicle?.photoURL, 300, 204));
const customerForm = reactive({
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
});
const touched = reactive({ prenom: false, nom: false, email: false });
const loading = ref(false);
const errorMsg = ref("");

const fieldErrors = computed(() => ({
  prenom: touched.prenom && !customerForm.prenom.trim(),
  nom: touched.nom && !customerForm.nom.trim(),
  email: touched.email && !customerForm.email.trim(),
}));

const modalCardRef = ref(null);
const initialConflict = ref(false);

function handleModalKeydown(e) {
  if (e.key === "Escape") {
    emit("close");
    return;
  }
  if (e.key === "Tab" && modalCardRef.value) {
    const focusable = Array.from(
      modalCardRef.value.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleModalKeydown);
  document.body.style.overflow = "";
});

// État local des dates — indépendant du searchStore global
const localStartDate = ref("");
const localEndDate = ref("");
const localStartTime = ref("09:00");
const localEndTime = ref("18:00");

// Plages déjà réservées pour CE véhicule (passées au DateRangePicker)
const disabledRanges = computed(() =>
  reservationStore.reservations
    .filter(
      (r) =>
        ["confirmee", "payee"].includes(r.statut) &&
        r.vehicleId === props.vehicle?.id,
    )
    .map((r) => ({ from: r.startDate, to: r.endDate })),
);

const currentStep = computed(() =>
  localStartDate.value && localEndDate.value ? 2 : 1,
);

// Garde de sécurité côté JS (le picker désactive déjà visuellement ces dates)
const isConflict = computed(() => {
  if (!localStartDate.value || !localEndDate.value) return false;
  const selStart = new Date(localStartDate.value);
  const selEnd = new Date(localEndDate.value);
  return disabledRanges.value.some(
    (r) => new Date(r.from) <= selEnd && new Date(r.to) >= selStart,
  );
});

// Bloquer le scroll du body quand le modal est ouvert
watch(
  () => props.visible,
  (val) => {
    document.body.style.overflow = val ? "hidden" : "";
    if (val) {
      const profile = userAuthStore.userProfile;
      const user = userAuthStore.user;
      imgFailed.value = false;
      Object.assign(customerForm, {
        prenom: profile?.prenom ?? "",
        nom: profile?.nom ?? "",
        email: user?.email ?? "",
        telephone: profile?.telephone ?? "",
      });
      Object.assign(touched, { prenom: false, nom: false, email: false });
      // Initialiser les dates locales depuis le searchStore
      localStartDate.value = searchStore.startDate;
      localEndDate.value = searchStore.endDate;
      localStartTime.value = searchStore.startTime || "09:00";
      localEndTime.value = searchStore.endTime || "18:00";
      errorMsg.value = "";
      loading.value = false;
      document.addEventListener("keydown", handleModalKeydown);
      initialConflict.value = isConflict.value;
      nextTick(() => {
        modalCardRef.value?.querySelector(".modal-close")?.focus();
      });
    } else {
      document.removeEventListener("keydown", handleModalKeydown);
      initialConflict.value = false;
    }
  },
);

async function handleSubmit() {
  if (loading.value) return;
  errorMsg.value = "";
  Object.assign(touched, { prenom: true, nom: true, email: true });

  if (!localStartDate.value || !localEndDate.value) {
    errorMsg.value = t("modal.selectBothDates");
    return;
  }
  if (localEndDate.value < localStartDate.value) {
    errorMsg.value = t("searchBanner.dateError");
    return;
  }
  if (isConflict.value) {
    errorMsg.value = t("modal.vehicleConflict");
    return;
  }
  if (
    !customerForm.prenom.trim() ||
    !customerForm.nom.trim() ||
    !customerForm.email.trim()
  ) {
    errorMsg.value = t("form.required");
    return;
  }

  loading.value = true;

  // Mettre à jour le searchStore avec les dates choisies dans le modal
  searchStore.startDate = localStartDate.value;
  searchStore.startTime = localStartTime.value;
  searchStore.endDate = localEndDate.value;
  searchStore.endTime = localEndTime.value;

  checkoutStore.vehicle = props.vehicle;
  checkoutStore.nom = `${customerForm.prenom} ${customerForm.nom}`.trim();
  checkoutStore.email = customerForm.email;
  checkoutStore.telephone = customerForm.telephone;
  checkoutStore.location = searchStore.location;
  checkoutStore.startDate = localStartDate.value;
  checkoutStore.startTime = localStartTime.value;
  checkoutStore.endDate = localEndDate.value;
  checkoutStore.endTime = localEndTime.value;

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
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}
.modal-card {
  background: #fff;
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 560px;
  position: relative;
  margin: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
}
.conflict-banner {
  background: #fff8e1;
  color: #7c5c00;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.modal-close:hover {
  background: #e0e0e0;
}

/* Vehicle summary */
.vehicle-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: var(--color-bg-page);
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
.vehicle-thumb--placeholder {
  background: #f0f2f8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vehicle-thumb--placeholder svg {
  width: 32px;
  height: 32px;
  stroke: #c0c8e0;
}
.vehicle-summary-info h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  color: var(--color-navy);
}
.vehicle-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag {
  background: #e8eaf6;
  color: var(--color-navy);
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
/* Progress steps */
.modal-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 1rem;
}
.modal-step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
}
.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #888;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background 0.25s,
    color 0.25s;
}
.step-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #aaa;
  transition: color 0.25s;
  white-space: nowrap;
}
.modal-step--active .step-num {
  background: var(--color-primary);
  color: #fff;
}
.modal-step--active .step-label {
  color: var(--color-navy);
}
.step-connector {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
  margin: 0 0.5rem;
}

.required-note {
  font-size: 0.78rem;
  color: #888;
  margin-top: -0.3rem;
  margin-bottom: 0.2rem;
}

.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-navy);
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
  border-color: var(--color-primary);
}
input.input--error {
  border-color: #c62828;
}
.field-error {
  font-size: 0.76rem;
  color: #c62828;
  font-weight: 600;
  margin-top: 0.1rem;
}
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.reserved-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #b91c1c;
  font-weight: 500;
}
.reserved-hint-sample {
  font-size: 0.72rem;
  font-weight: 700;
  color: #b91c1c;
  text-decoration: line-through;
  text-decoration-color: rgba(185, 28, 28, 0.55);
  background: rgba(185, 28, 28, 0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1.4;
}
.dates-conflict-msg {
  margin: 0.3rem 0 0;
  background: #fce4ec;
  color: #c62828;
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
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
  background: var(--color-primary);
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
  background: var(--color-primary-dark);
}
.btn-confirm:disabled {
  background: #f4a0a6;
  cursor: not-allowed;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spin {
  animation: spin 0.8s linear infinite;
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
