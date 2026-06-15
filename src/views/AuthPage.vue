<template>
  <div class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="back-home">{{ t("auth.backHome") }}</RouterLink>

      <div class="auth-logo">
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

      <div class="auth-tabs">
        <button
          :class="['tab-btn', { active: tab === 'login' }]"
          @click="switchTab('login')"
        >
          {{ t("auth.login") }}
        </button>
        <button
          :class="['tab-btn', { active: tab === 'register' }]"
          @click="switchTab('register')"
        >
          {{ t("auth.register") }}
        </button>
      </div>

      <!-- Connexion -->
      <form
        v-if="tab === 'login'"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <div class="field">
          <label>{{ t("auth.email") }}</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label>{{ t("auth.password") }}</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showLoginPassword ? 'text' : 'password'"
              :placeholder="t('auth.passwordPlaceholder')"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showLoginPassword = !showLoginPassword"
              :aria-label="showLoginPassword ? 'Masquer' : 'Afficher'"
            >
              <svg
                v-if="showLoginPassword"
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
        <p v-if="errorMsg" class="error-msg">
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
          {{ errorMsg }}
        </p>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? t("auth.loggingIn") : t("auth.login") }}
        </button>
      </form>

      <!-- Inscription -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="field-row">
          <div class="field">
            <label>{{ t("auth.firstName") }}</label>
            <input
              v-model="registerForm.prenom"
              type="text"
              :placeholder="t('auth.firstNamePlaceholder')"
              required
              autocomplete="given-name"
            />
          </div>
          <div class="field">
            <label>{{ t("auth.lastName") }}</label>
            <input
              v-model="registerForm.nom"
              type="text"
              :placeholder="t('auth.lastNamePlaceholder')"
              required
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="field">
          <label>{{ t("auth.email") }}</label>
          <input
            v-model="registerForm.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            required
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label>{{ t("auth.password") }}</label>
          <div class="password-wrapper">
            <input
              v-model="registerForm.password"
              :type="showRegisterPassword ? 'text' : 'password'"
              :placeholder="t('auth.passwordHint')"
              required
              minlength="6"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showRegisterPassword = !showRegisterPassword"
              :aria-label="showRegisterPassword ? 'Masquer' : 'Afficher'"
            >
              <svg
                v-if="showRegisterPassword"
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
        <div class="field">
          <label>{{ t("auth.password") }} (confirm)</label>
          <div class="password-wrapper">
            <input
              v-model="registerForm.confirm"
              :type="showRegisterConfirm ? 'text' : 'password'"
              :placeholder="t('auth.passwordPlaceholder')"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showRegisterConfirm = !showRegisterConfirm"
              :aria-label="showRegisterConfirm ? 'Masquer' : 'Afficher'"
            >
              <svg
                v-if="showRegisterConfirm"
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
        <p v-if="errorMsg" class="error-msg">
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
          {{ errorMsg }}
        </p>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? t("auth.registering") : t("auth.registerBtn") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { userAuthStore } from "../store/userAuth.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const tab = ref("login");
const loading = ref(false);
const errorMsg = ref("");
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showRegisterConfirm = ref(false);

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
    const role = await userAuthStore.login(loginForm.email, loginForm.password);
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push(route.query.redirect || "/account");
    }
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
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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
  min-width: 0;
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

.error-msg {
  color: #c62828;
  font-size: 0.88rem;
  margin: 0;
  padding: 0.6rem 0.8rem;
  background: #fce4ec;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.error-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
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
