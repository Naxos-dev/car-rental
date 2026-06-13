<template>
  <div class="account-page">
    <div class="container">
      <!-- En-tête -->
      <div class="account-header">
        <div>
          <h1 class="account-title">{{ t("account.title") }}</h1>
          <p v-if="userAuthStore.userProfile" class="account-name">
            {{ userAuthStore.userProfile.prenom }}
            {{ userAuthStore.userProfile.nom }}
          </p>
          <p class="account-email">{{ userAuthStore.user?.email }}</p>
        </div>
        <button class="btn-logout" @click="handleLogout">
          {{ t("account.logout") }}
        </button>
      </div>

      <!-- Onglets -->
      <div class="account-tabs">
        <button
          :class="['tab-btn', { active: section === 'reservations' }]"
          @click="section = 'reservations'"
        >
          {{ t("account.reservations") }}
        </button>
        <button
          :class="['tab-btn', { active: section === 'settings' }]"
          @click="section = 'settings'"
        >
          {{ t("account.settings") }}
        </button>
      </div>

      <!-- Section : Réservations -->
      <div v-if="section === 'reservations'" class="section-content">
        <div v-if="reservationStore.loading" class="empty-state">
          {{ t("account.loading") }}
        </div>
        <div v-else-if="myReservations.length === 0" class="empty-state">
          <p>{{ t("account.noReservations") }}</p>
          <RouterLink to="/" class="btn-cta-link">
            {{ t("account.seeVehicles") }}
          </RouterLink>
        </div>
        <div v-else class="reservations-sections">
          <!-- À venir -->
          <div class="res-section">
            <h2 class="res-section-title">{{ t("account.upcomingReservations") }}</h2>
            <p v-if="upcomingReservations.length === 0" class="res-section-empty">
              {{ t("account.noUpcomingReservations") }}
            </p>
            <div v-else class="reservations-list">
              <div v-for="r in upcomingReservations" :key="r.id" class="reservation-card">
                <div class="res-header">
                  <span class="res-vehicle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="res-icon">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                    {{ r.vehicleLabel }}
                  </span>
                  <span :class="['res-badge', `badge--${r.statut}`]">
                    {{ STATUS_LABELS[r.statut] ?? r.statut }}
                  </span>
                </div>
                <div class="res-details">
                  <span class="res-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ r.location }}
                  </span>
                  <span class="res-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ r.startDate }} → {{ r.endDate }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Anciennes -->
          <div class="res-section">
            <h2 class="res-section-title">{{ t("account.pastReservations") }}</h2>
            <p v-if="pastReservations.length === 0" class="res-section-empty">
              {{ t("account.noPastReservations") }}
            </p>
            <div v-else class="reservations-list">
              <div v-for="r in pastReservations" :key="r.id" class="reservation-card reservation-card--past">
                <div class="res-header">
                  <span class="res-vehicle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="res-icon">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                    {{ r.vehicleLabel }}
                  </span>
                  <span :class="['res-badge', `badge--${r.statut}`]">
                    {{ STATUS_LABELS[r.statut] ?? r.statut }}
                  </span>
                </div>
                <div class="res-details">
                  <span class="res-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ r.location }}
                  </span>
                  <span class="res-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ r.startDate }} → {{ r.endDate }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section : Paramètres -->
      <div v-if="section === 'settings'" class="section-content">
        <div class="settings-grid">
          <!-- Modifier l'email -->
          <div class="settings-card">
            <h2>{{ t("account.updateEmail") }}</h2>
            <p class="current-val">
              {{ t("account.currentEmail") }}
              <strong>{{ userAuthStore.user?.email }}</strong>
            </p>
            <form @submit.prevent="handleUpdateEmail">
              <div class="field">
                <label>{{ t("account.newEmail") }}</label>
                <input
                  v-model="emailForm.newEmail"
                  type="email"
                  :placeholder="t('account.newEmailPlaceholder')"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t("account.currentPassword") }}</label>
                <div class="password-wrapper">
                  <input
                    v-model="emailForm.password"
                    :type="showEmailPassword ? 'text' : 'password'"
                    :placeholder="t('account.currentPasswordPlaceholder')"
                    required
                  />
                  <button type="button" class="toggle-password" @click="showEmailPassword = !showEmailPassword" :aria-label="showEmailPassword ? 'Masquer' : 'Afficher'">
                    <svg v-if="showEmailPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p
                v-if="emailMsg.text"
                :class="['msg', emailMsg.ok ? 'msg--ok' : 'msg--err']"
              >
                {{ emailMsg.text }}
              </p>
              <button type="submit" class="btn-save" :disabled="emailLoading">
                {{
                  emailLoading
                    ? t("account.updating")
                    : t("account.updateEmailBtn")
                }}
              </button>
            </form>
          </div>

          <!-- Changer le mot de passe -->
          <div class="settings-card">
            <h2>{{ t("account.changePassword") }}</h2>
            <form @submit.prevent="handleUpdatePassword">
              <div class="field">
                <label>{{ t("account.currentPassword") }}</label>
                <div class="password-wrapper">
                  <input
                    v-model="passwordForm.current"
                    :type="showPasswordCurrent ? 'text' : 'password'"
                    :placeholder="t('auth.passwordPlaceholder')"
                    required
                  />
                  <button type="button" class="toggle-password" @click="showPasswordCurrent = !showPasswordCurrent" :aria-label="showPasswordCurrent ? 'Masquer' : 'Afficher'">
                    <svg v-if="showPasswordCurrent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="field">
                <label>{{ t("account.newPassword") }}</label>
                <div class="password-wrapper">
                  <input
                    v-model="passwordForm.new"
                    :type="showPasswordNew ? 'text' : 'password'"
                    :placeholder="t('account.newPasswordPlaceholder')"
                    required
                    minlength="6"
                  />
                  <button type="button" class="toggle-password" @click="showPasswordNew = !showPasswordNew" :aria-label="showPasswordNew ? 'Masquer' : 'Afficher'">
                    <svg v-if="showPasswordNew" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="field">
                <label>{{ t("account.confirmPassword") }}</label>
                <div class="password-wrapper">
                  <input
                    v-model="passwordForm.confirm"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    :placeholder="t('account.confirmPasswordPlaceholder')"
                    required
                  />
                  <button type="button" class="toggle-password" @click="showPasswordConfirm = !showPasswordConfirm" :aria-label="showPasswordConfirm ? 'Masquer' : 'Afficher'">
                    <svg v-if="showPasswordConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p
                v-if="passwordMsg.text"
                :class="['msg', passwordMsg.ok ? 'msg--ok' : 'msg--err']"
              >
                {{ passwordMsg.text }}
              </p>
              <button
                type="submit"
                class="btn-save"
                :disabled="passwordLoading"
              >
                {{
                  passwordLoading
                    ? t("account.updating")
                    : t("account.changePasswordBtn")
                }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { userAuthStore } from "../store/userAuth.js";
import { reservationStore } from "../store/reservations.js";

const { t } = useI18n();
const router = useRouter();
const section = ref("reservations");

const STATUS_LABELS = computed(() => ({
  confirmee: t("statusLabels.confirmee"),
  annulee: t("statusLabels.annulee"),
}));

const myReservations = computed(() =>
  reservationStore.reservations.filter(
    (r) => r.userId === userAuthStore.user?.uid,
  ),
);

const today = new Date();
today.setHours(0, 0, 0, 0);

const upcomingReservations = computed(() =>
  myReservations.value.filter((r) => new Date(r.startDate) > today),
);

const pastReservations = computed(() =>
  myReservations.value.filter((r) => new Date(r.startDate) <= today),
);

async function handleLogout() {
  await userAuthStore.logout();
  router.push("/");
}

const showEmailPassword = ref(false);
const showPasswordCurrent = ref(false);
const showPasswordNew = ref(false);
const showPasswordConfirm = ref(false);

// — Modifier l'email
const emailForm = reactive({ newEmail: "", password: "" });
const emailLoading = ref(false);
const emailMsg = reactive({ text: "", ok: false });

async function handleUpdateEmail() {
  emailLoading.value = true;
  emailMsg.text = "";
  try {
    await userAuthStore.updateUserEmail(emailForm.newEmail, emailForm.password);
    emailMsg.ok = true;
    emailMsg.text = "Un lien de vérification a été envoyé à votre nouvel email. L'adresse sera mise à jour après confirmation.";
    emailForm.newEmail = "";
    emailForm.password = "";
  } catch {
    emailMsg.ok = false;
    emailMsg.text = userAuthStore.error || "Erreur lors de la mise à jour.";
  } finally {
    emailLoading.value = false;
  }
}

// — Changer le mot de passe
const passwordForm = reactive({ current: "", new: "", confirm: "" });
const passwordLoading = ref(false);
const passwordMsg = reactive({ text: "", ok: false });

async function handleUpdatePassword() {
  if (passwordForm.new !== passwordForm.confirm) {
    passwordMsg.ok = false;
    passwordMsg.text = "Les mots de passe ne correspondent pas.";
    return;
  }
  passwordLoading.value = true;
  passwordMsg.text = "";
  try {
    await userAuthStore.updateUserPassword(
      passwordForm.current,
      passwordForm.new,
    );
    passwordMsg.ok = true;
    passwordMsg.text = "Mot de passe changé avec succès.";
    Object.assign(passwordForm, { current: "", new: "", confirm: "" });
  } catch {
    passwordMsg.ok = false;
    passwordMsg.text = userAuthStore.error || "Erreur lors du changement.";
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background: #f8f9ff;
  padding: 3rem 0 5rem;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.account-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.account-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}
.account-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0.15rem 0 0.1rem;
}
.account-email {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
}
.btn-logout {
  background: #fce4ec;
  color: #c62828;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-logout:hover {
  background: #f8bbd0;
}

.account-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e8e8f0;
}
.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  border-radius: 8px 8px 0 0;
}
.tab-btn.active {
  color: #1a1a2e;
  font-weight: 700;
  border-bottom-color: #667eea;
}
.tab-btn:hover:not(.active) {
  background: #f0f2f8;
  color: #1a1a2e;
}

.section-content {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
.btn-cta-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-cta-link:hover {
  opacity: 0.9;
}

.reservations-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.res-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid #e8e8f0;
}
.res-section-empty {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0;
}
.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.reservation-card {
  border: 1.5px solid #e8e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: box-shadow 0.2s;
}
.reservation-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
}
.reservation-card--past {
  background: #f4f4f8;
  border-color: #e0e0ea;
  color: #888;
}
.reservation-card--past .res-vehicle {
  color: #666;
}
.reservation-card--past .res-details {
  color: #aaa;
}
.res-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.res-vehicle {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.res-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #667eea;
}
.res-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}
.badge--confirmee {
  background: #dcfce7;
  color: #166534;
}
.badge--annulee {
  background: #f3f4f6;
  color: #6b7280;
}
.res-details {
  display: flex;
  gap: 1.5rem;
  color: #666;
  font-size: 0.9rem;
  flex-wrap: wrap;
}
.res-detail-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.detail-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: #888;
}

/* Settings */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .account-title {
    font-size: 1.5rem;
  }
  .account-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .account-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .tab-btn {
    white-space: nowrap;
    padding: 0.65rem 1rem;
    font-size: 0.88rem;
  }
  .res-details {
    flex-direction: column;
    gap: 0.3rem;
  }
}
.settings-card {
  background: #f8f9ff;
  border-radius: 14px;
  padding: 1.5rem;
  border: 1.5px solid #e8e8f0;
}
.settings-card h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}
.current-val {
  font-size: 0.88rem;
  color: #888;
  margin: 0 0 1rem;
}
.settings-card form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}
.field input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.field input:focus {
  border-color: #667eea;
}
.password-wrapper {
  position: relative;
}
.password-wrapper input {
  padding-right: 3rem;
}
.toggle-password {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  color: #888;
  display: flex;
  align-items: center;
}
.toggle-password:hover {
  color: #1a1a2e;
}
.msg {
  font-size: 0.88rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}
.msg--ok {
  background: #dcfce7;
  color: #166534;
}
.msg--err {
  background: #fce4ec;
  color: #c62828;
}
.btn-save {
  padding: 0.7rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
