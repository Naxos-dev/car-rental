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

      <div v-if="tab !== 'forgot'" class="auth-tabs" role="tablist">
        <button
          id="tab-login"
          role="tab"
          :aria-selected="tab === 'login'"
          aria-controls="panel-login"
          :class="['tab-btn', { active: tab === 'login' }]"
          @click="switchTab('login')"
          @keydown="handleTabKeydown($event, 'login')"
        >
          {{ t("auth.login") }}
        </button>
        <button
          id="tab-register"
          role="tab"
          :aria-selected="tab === 'register'"
          aria-controls="panel-register"
          :class="['tab-btn', { active: tab === 'register' }]"
          @click="switchTab('register')"
          @keydown="handleTabKeydown($event, 'register')"
        >
          {{ t("auth.register") }}
        </button>
      </div>

      <!-- Connexion -->
      <form
        v-if="tab === 'login'"
        id="panel-login"
        role="tabpanel"
        tabindex="-1"
        aria-labelledby="tab-login"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <div class="field">
          <label for="login-email">{{ t("auth.email") }}</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <div class="label-row">
            <label for="login-password">{{ t("auth.password") }}</label>
            <button type="button" class="link-btn" @click="tab = 'forgot'">
              {{ t("auth.forgotPassword") }}
            </button>
          </div>
          <div class="password-wrapper">
            <input
              id="login-password"
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
              :aria-label="showLoginPassword ? t('common.hidePassword') : t('common.showPassword')"
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
      <form
        v-else-if="tab === 'register'"
        id="panel-register"
        role="tabpanel"
        tabindex="-1"
        aria-labelledby="tab-register"
        class="auth-form"
        @submit.prevent="handleRegister"
      >
        <div class="field-row">
          <div class="field">
            <label for="reg-prenom">{{ t("auth.firstName") }}</label>
            <input
              id="reg-prenom"
              v-model="registerForm.prenom"
              type="text"
              :placeholder="t('auth.firstNamePlaceholder')"
              required
              autocomplete="given-name"
            />
          </div>
          <div class="field">
            <label for="reg-nom">{{ t("auth.lastName") }}</label>
            <input
              id="reg-nom"
              v-model="registerForm.nom"
              type="text"
              :placeholder="t('auth.lastNamePlaceholder')"
              required
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="field">
          <label for="reg-email">{{ t("auth.email") }}</label>
          <input
            id="reg-email"
            v-model="registerForm.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            required
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label for="reg-phone">{{ t("auth.phone") }}</label>
          <input
            id="reg-phone"
            v-model="registerForm.telephone"
            type="tel"
            :placeholder="t('auth.phonePlaceholder')"
            autocomplete="tel"
          />
        </div>
        <div class="field">
          <label for="reg-password">{{ t("auth.password") }}</label>
          <div class="password-wrapper">
            <input
              id="reg-password"
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
              :aria-label="showRegisterPassword ? t('common.hidePassword') : t('common.showPassword')"
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
          <div v-if="registerForm.password.length >= 3" class="password-strength" aria-live="polite">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="`strength--${passwordStrength}`"
                :style="{ width: (passwordStrength / 4 * 100) + '%' }"
              ></div>
            </div>
            <span class="strength-label">
              {{ t("auth.passwordStrengthLabel") }}
              {{ t(`auth.passwordStrength.${passwordStrength || 1}`) }}
            </span>
          </div>
          <ul v-if="registerForm.password.length >= 1" class="password-reqs" aria-live="polite">
            <li :class="['req-item', { 'req-item--ok': registerForm.password.length >= 6 }]">
              <svg v-if="registerForm.password.length >= 6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="req-icon req-icon--check" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="req-icon" aria-hidden="true"><circle cx="12" cy="12" r="3"/></svg>
              {{ t('auth.reqLength') }}
            </li>
            <li :class="['req-item', { 'req-item--ok': /[A-Z]/.test(registerForm.password) }]">
              <svg v-if="/[A-Z]/.test(registerForm.password)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="req-icon req-icon--check" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="req-icon" aria-hidden="true"><circle cx="12" cy="12" r="3"/></svg>
              {{ t('auth.reqUppercase') }}
            </li>
            <li :class="['req-item', { 'req-item--ok': /[0-9]/.test(registerForm.password) }]">
              <svg v-if="/[0-9]/.test(registerForm.password)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="req-icon req-icon--check" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="req-icon" aria-hidden="true"><circle cx="12" cy="12" r="3"/></svg>
              {{ t('auth.reqNumber') }}
            </li>
          </ul>
        </div>
        <div class="field">
          <label for="reg-confirm">{{ t("auth.passwordConfirm") }}</label>
          <div class="password-wrapper">
            <input
              id="reg-confirm"
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
              :aria-label="showRegisterConfirm ? t('common.hidePassword') : t('common.showPassword')"
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

      <!-- Séparateur + Google -->
      <div v-if="tab !== 'forgot'" class="divider">
        <span>{{ t("auth.or") }}</span>
      </div>
      <button
        v-if="tab !== 'forgot'"
        type="button"
        class="btn-google"
        :disabled="loading"
        @click="handleGoogleLogin"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {{ tab === 'login' ? t("auth.loginWithGoogle") : t("auth.continueWithGoogle") }}
      </button>

      <!-- Mot de passe oublié -->
      <div v-if="tab === 'forgot'" class="forgot-section">
        <button type="button" class="link-btn back-link" @click="switchTab('login')">
          ← {{ t("auth.backToLogin") }}
        </button>
        <h2 class="forgot-title">{{ t("auth.forgotTitle") }}</h2>
        <p class="forgot-desc">{{ t("auth.forgotDesc") }}</p>
        <form class="auth-form" @submit.prevent="handleReset">
          <div class="field">
            <label for="forgot-email">{{ t("auth.email") }}</label>
            <input
              id="forgot-email"
              v-model="forgotEmail"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              autocomplete="email"
              required
            />
          </div>
          <p
            v-if="forgotMsg.text"
            :class="['msg-inline', forgotMsg.ok ? 'msg-inline--ok' : 'msg-inline--err']"
          >{{ forgotMsg.text }}</p>
          <button type="submit" class="btn-auth" :disabled="forgotLoading">
            {{ forgotLoading ? t("auth.sending") : t("auth.sendReset") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore as userAuthStore } from "../store/auth.js";

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
  telephone: "",
  password: "",
  confirm: "",
});

// Forgot password
const forgotEmail = ref("");
const forgotLoading = ref(false);
const forgotMsg = reactive({ text: "", ok: false });

const passwordStrength = computed(() => {
  const p = registerForm.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});

function handleTabKeydown(e, current) {
  const tabs = ["login", "register"];
  const idx = tabs.indexOf(current);
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    switchTab(tabs[(idx + 1) % tabs.length]);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    switchTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
  }
}

onMounted(() => {
  if (userAuthStore.isAuthenticated) {
    const redirect = route.query.redirect;
    const target = typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/account";
    router.replace(target);
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
      const redirect = route.query.redirect;
      const target = typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/account";
      router.push(target);
    }
  } catch {
    errorMsg.value = userAuthStore.error || t("auth.loginError");
  } finally {
    loading.value = false;
  }
}

async function handleGoogleLogin() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const role = await userAuthStore.loginWithGoogle();
    if (role === "admin") {
      router.push("/admin");
    } else {
      const redirect = route.query.redirect;
      const target = typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/account";
      router.push(target);
    }
  } catch {
    if (userAuthStore.error) {
      errorMsg.value = userAuthStore.error;
    }
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (registerForm.password !== registerForm.confirm) {
    errorMsg.value = t("auth.passwordMismatch");
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
      registerForm.telephone,
    );
    const redirect = route.query.redirect;
    const target = typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/account";
    router.push(target);
  } catch {
    errorMsg.value = userAuthStore.error || t("auth.registerError");
  } finally {
    loading.value = false;
  }
}

async function handleReset() {
  forgotLoading.value = true;
  forgotMsg.text = "";
  try {
    await userAuthStore.resetPassword(forgotEmail.value);
    forgotMsg.ok = true;
    forgotMsg.text = t("auth.resetSent");
    forgotEmail.value = "";
  } catch {
    forgotMsg.ok = false;
    forgotMsg.text = userAuthStore.error || t("auth.loginError");
  } finally {
    forgotLoading.value = false;
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
  color: var(--color-navy);
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
  color: var(--color-navy);
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
  color: var(--color-navy);
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
  border-color: var(--color-primary);
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
  color: var(--color-navy);
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
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-auth:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
.btn-auth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0.5rem;
  color: #aaa;
  font-size: 0.82rem;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-google:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #bbb;
}
.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Label row (password label + forgot link) */
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Generic text link button */
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.82rem;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.link-btn:hover {
  color: var(--color-primary-dark);
}

/* Password strength bar */
.password-strength {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.strength-bar {
  flex: 1;
  height: 4px;
  background: #e8e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s, background 0.3s;
}
.strength--1 { background: var(--color-primary); }
.strength--2 { background: #f59e0b; }
.strength--3 { background: #3b82f6; }
.strength--4 { background: #16a34a; }
.strength-label {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
}

.password-reqs {
  list-style: none;
  padding: 0;
  margin: 0.3rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.req-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #aaa;
  transition: color 0.2s;
}
.req-item--ok {
  color: #16a34a;
}
.req-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
.req-icon--check {
  color: #16a34a;
}

/* Forgot password section */
.forgot-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.back-link {
  font-size: 0.85rem;
  text-decoration: none;
  align-self: flex-start;
}
.forgot-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
}
.forgot-desc {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Inline message (forgot success/error) */
.msg-inline {
  font-size: 0.88rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin: 0;
}
.msg-inline--ok {
  background: #dcfce7;
  color: #166534;
}
.msg-inline--err {
  background: #fce4ec;
  color: #c62828;
}
</style>
