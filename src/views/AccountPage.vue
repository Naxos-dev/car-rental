<template>
  <div class="account-page">
    <div class="container">
      <!-- En-tête -->
      <div class="account-header">
        <div>
          <h1 class="account-title">Mon compte</h1>
          <p v-if="userAuthStore.userProfile" class="account-name">
            {{ userAuthStore.userProfile.prenom }}
            {{ userAuthStore.userProfile.nom }}
          </p>
          <p class="account-email">{{ userAuthStore.user?.email }}</p>
        </div>
        <button class="btn-logout" @click="handleLogout">Se déconnecter</button>
      </div>

      <!-- Onglets -->
      <div class="account-tabs">
        <button
          :class="['tab-btn', { active: section === 'reservations' }]"
          @click="section = 'reservations'"
        >
          🚗 Mes réservations
        </button>
        <button
          :class="['tab-btn', { active: section === 'settings' }]"
          @click="section = 'settings'"
        >
          ⚙️ Paramètres
        </button>
      </div>

      <!-- Section : Réservations -->
      <div v-if="section === 'reservations'" class="section-content">
        <div v-if="reservationStore.loading" class="empty-state">
          Chargement...
        </div>
        <div v-else-if="myReservations.length === 0" class="empty-state">
          <p>Vous n'avez pas encore de réservation.</p>
          <RouterLink to="/" class="btn-cta-link">
            Voir les véhicules →
          </RouterLink>
        </div>
        <div v-else class="reservations-list">
          <div v-for="r in myReservations" :key="r.id" class="reservation-card">
            <div class="res-header">
              <span class="res-vehicle">🚗 {{ r.vehicleLabel }}</span>
              <span :class="['res-badge', `badge--${r.statut}`]">
                {{ STATUS_LABELS[r.statut] ?? r.statut }}
              </span>
            </div>
            <div class="res-details">
              <span>📍 {{ r.location }}</span>
              <span>📅 {{ r.startDate }} → {{ r.endDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section : Paramètres -->
      <div v-if="section === 'settings'" class="section-content">
        <div class="settings-grid">
          <!-- Modifier l'email -->
          <div class="settings-card">
            <h2>📧 Modifier l'email</h2>
            <p class="current-val">
              Email actuel : <strong>{{ userAuthStore.user?.email }}</strong>
            </p>
            <form @submit.prevent="handleUpdateEmail">
              <div class="field">
                <label>Nouvel email</label>
                <input
                  v-model="emailForm.newEmail"
                  type="email"
                  placeholder="nouveau@exemple.com"
                  required
                />
              </div>
              <div class="field">
                <label>Mot de passe actuel</label>
                <input
                  v-model="emailForm.password"
                  type="password"
                  placeholder="Pour confirmer votre identité"
                  required
                />
              </div>
              <p
                v-if="emailMsg.text"
                :class="['msg', emailMsg.ok ? 'msg--ok' : 'msg--err']"
              >
                {{ emailMsg.text }}
              </p>
              <button type="submit" class="btn-save" :disabled="emailLoading">
                {{ emailLoading ? "Mise à jour..." : "Mettre à jour l'email" }}
              </button>
            </form>
          </div>

          <!-- Changer le mot de passe -->
          <div class="settings-card">
            <h2>🔒 Changer le mot de passe</h2>
            <form @submit.prevent="handleUpdatePassword">
              <div class="field">
                <label>Mot de passe actuel</label>
                <input
                  v-model="passwordForm.current"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div class="field">
                <label>Nouveau mot de passe</label>
                <input
                  v-model="passwordForm.new"
                  type="password"
                  placeholder="Au moins 6 caractères"
                  required
                  minlength="6"
                />
              </div>
              <div class="field">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  v-model="passwordForm.confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                />
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
                  passwordLoading ? "Mise à jour..." : "Changer le mot de passe"
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
import { userAuthStore } from "../store/userAuth.js";
import { reservationStore } from "../store/reservations.js";

const router = useRouter();
const section = ref("reservations");

const STATUS_LABELS = {
  en_attente: "⏳ En attente",
  payee: "💳 Payée",
  confirmee: "✅ Confirmée",
  annulee: "❌ Annulée",
};

const myReservations = computed(() =>
  reservationStore.reservations.filter(
    (r) => r.userId === userAuthStore.user?.uid,
  ),
);

async function handleLogout() {
  await userAuthStore.logout();
  router.push("/");
}

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
    emailMsg.text = "Email mis à jour avec succès.";
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
}
.res-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}
.badge--en_attente {
  background: #fef3c7;
  color: #92400e;
}
.badge--payee {
  background: #dbeafe;
  color: #1e40af;
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
}
.field input:focus {
  border-color: #667eea;
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
