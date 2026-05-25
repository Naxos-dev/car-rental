<template>
  <div class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="back-home">← Retour à l'accueil</RouterLink>

      <div class="auth-logo">
        <span class="logo-icon">🚗</span>
        <span class="logo-text">AutoLoc</span>
      </div>

      <div class="auth-tabs">
        <button
          :class="['tab-btn', { active: tab === 'login' }]"
          @click="switchTab('login')"
        >
          Se connecter
        </button>
        <button
          :class="['tab-btn', { active: tab === 'register' }]"
          @click="switchTab('register')"
        >
          Créer un compte
        </button>
      </div>

      <!-- Connexion -->
      <form
        v-if="tab === 'login'"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <div class="field">
          <label>Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="jean@exemple.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>
        <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? "Connexion en cours..." : "Se connecter" }}
        </button>
      </form>

      <!-- Inscription -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="field-row">
          <div class="field">
            <label>Prénom</label>
            <input
              v-model="registerForm.prenom"
              type="text"
              placeholder="Jean"
              required
              autocomplete="given-name"
            />
          </div>
          <div class="field">
            <label>Nom</label>
            <input
              v-model="registerForm.nom"
              type="text"
              placeholder="Dupont"
              required
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="jean@exemple.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="Au moins 6 caractères"
            required
            minlength="6"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label>Confirmer le mot de passe</label>
          <input
            v-model="registerForm.confirm"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>
        <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? "Création en cours..." : "Créer mon compte" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { userAuthStore } from "../store/userAuth.js";

const router = useRouter();
const route = useRoute();

const tab = ref("login");
const loading = ref(false);
const errorMsg = ref("");

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({
  prenom: "",
  nom: "",
  email: "",
  password: "",
  confirm: "",
});

onMounted(() => {
  if (userAuthStore.isAuthenticated) {
    router.replace(route.query.redirect || "/account");
  }
});

function switchTab(newTab) {
  tab.value = newTab;
  errorMsg.value = "";
}

async function handleLogin() {
  loading.value = true;
  errorMsg.value = "";
  try {
    await userAuthStore.login(loginForm.email, loginForm.password);
    router.push(route.query.redirect || "/account");
  } catch {
    errorMsg.value = userAuthStore.error || "Erreur de connexion.";
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (registerForm.password !== registerForm.confirm) {
    errorMsg.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await userAuthStore.register(
      registerForm.email,
      registerForm.password,
      registerForm.prenom,
      registerForm.nom,
    );
    router.push(route.query.redirect || "/account");
  } catch {
    errorMsg.value =
      userAuthStore.error || "Erreur lors de la création du compte.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

.back-home {
  display: inline-block;
  text-decoration: none;
  color: #888;
  font-size: 0.88rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}
.back-home:hover {
  color: #1a1a2e;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}
.logo-icon {
  font-size: 1.8rem;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.auth-tabs {
  display: flex;
  gap: 0.4rem;
  background: #f0f2f8;
  border-radius: 10px;
  padding: 0.3rem;
  margin-bottom: 1.75rem;
}
.tab-btn {
  flex: 1;
  padding: 0.6rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}
.tab-btn.active {
  background: #fff;
  color: #1a1a2e;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}
.field-row .field {
  flex: 1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #444;
}
.field input {
  padding: 0.72rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
}
.field input:focus {
  border-color: #667eea;
}

.error-msg {
  color: #c62828;
  font-size: 0.88rem;
  margin: 0;
  padding: 0.6rem 0.8rem;
  background: #fce4ec;
  border-radius: 8px;
}

.btn-auth {
  margin-top: 0.25rem;
  padding: 0.85rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-auth:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-auth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
