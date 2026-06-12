<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <svg
          class="logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#e63946"
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
        <span class="logo-text">AutoLoc</span>
      </div>
      <h1>Accès Back-office</h1>
      <p class="login-subtitle">Connectez-vous pour gérer les véhicules</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@autoloc.fr"
            autocomplete="username"
            required
          />
        </div>

        <div class="field">
          <label for="password">Mot de passe</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Masquer' : 'Afficher'"
            >
              <svg
                v-if="showPassword"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                width="16"
                height="16"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                width="16"
                height="16"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="authStore.error" class="error-msg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="error-icon"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {{ authStore.error }}
        </p>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <RouterLink to="/" class="back-link">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="back-icon"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Retour au site
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "../store/auth.js";

const router = useRouter();
const loading = ref(false);
const showPassword = ref(false);

const form = reactive({ email: "", password: "" });

async function handleLogin() {
  loading.value = true;
  authStore.error = null;
  try {
    await authStore.login(form.email, form.password);
    router.push("/admin");
  } catch {
    // L'erreur est gérée dans authStore.error
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.login-card {
  background: #fff;
  border-radius: 18px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}
.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a2e;
}
h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.4rem;
}
.login-subtitle {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  text-align: left;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  border-color: #e63946;
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
.error-msg {
  background: #fce4ec;
  color: #c62828;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.error-icon {
  flex-shrink: 0;
}
.btn-login {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.3rem;
}
.btn-login:hover:not(:disabled) {
  background: #c1121f;
}
.btn-login:disabled {
  background: #f4a0a6;
  cursor: not-allowed;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1.5rem;
  color: #888;
  font-size: 0.88rem;
  text-decoration: none;
}
.back-link:hover {
  color: #1a1a2e;
}
.back-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
