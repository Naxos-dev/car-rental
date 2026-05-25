<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <span>🚗</span>
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
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="authStore.error" class="error-msg">⚠️ {{ authStore.error }}</p>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <RouterLink to="/" class="back-link">← Retour au site</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../store/auth.js'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({ email: '', password: '' })

async function handleLogin() {
  loading.value = true
  authStore.error = null
  try {
    await authStore.login(form.email, form.password)
    router.push('/admin')
  } catch {
    // L'erreur est gérée dans authStore.error
  } finally {
    loading.value = false
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
  font-size: 2rem;
  margin-bottom: 1.2rem;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-left: 0.4rem;
  vertical-align: middle;
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
input:focus { border-color: #e63946; }
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
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}
.error-msg {
  background: #fce4ec;
  color: #c62828;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.88rem;
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
.btn-login:hover:not(:disabled) { background: #c1121f; }
.btn-login:disabled { background: #f4a0a6; cursor: not-allowed; }
.back-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #888;
  font-size: 0.88rem;
  text-decoration: none;
}
.back-link:hover { color: #1a1a2e; }
</style>
