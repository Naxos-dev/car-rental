<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">
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
      </RouterLink>

      <!-- Burger -->
      <button
        class="burger"
        @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')"
      >
        <span :class="['burger-line', { open: mobileOpen }]"></span>
        <span :class="['burger-line', { open: mobileOpen }]"></span>
        <span :class="['burger-line', { open: mobileOpen }]"></span>
      </button>

      <nav
        :class="['nav', { 'nav--open': mobileOpen }]"
        @click="mobileOpen = false"
      >
        <RouterLink to="/" class="nav-link">{{ t("nav.home") }}</RouterLink>
        <RouterLink to="/fleet" class="nav-link">{{
          t("nav.fleet")
        }}</RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn-admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-admin-icon">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Admin
        </RouterLink>

        <!-- Boutons admin (back-office) -->
        <template v-if="authStore.isAdmin && isAdminRoute">
          <span class="user-info">{{ authStore.user?.email }}</span>
          <button class="btn-logout" @click="handleAdminLogout">
            {{ t("nav.logout") }}
          </button>
        </template>

        <!-- Boutons client (pages publiques) -->
        <template v-else-if="!isAdminRoute">
          <template v-if="userAuthStore.isAuthenticated">
            <div class="user-menu" ref="menuRef">
              <button class="btn-user" @click="toggleMenu">
                <svg class="user-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                  />
                </svg>
                <span class="user-prenom">{{
                  userAuthStore.userProfile?.prenom || userAuthStore.user?.email
                }}</span>
                <svg
                  class="chevron"
                  :class="{ open: menuOpen }"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              <div v-if="menuOpen" class="dropdown">
                <RouterLink
                  to="/account"
                  class="dropdown-item"
                  @click="menuOpen = false"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                    />
                  </svg>
                  {{ t("nav.myAccount") }}
                </RouterLink>
                <button class="dropdown-item danger" @click="handleUserLogout">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                    />
                  </svg>
                  {{ t("nav.logout") }}
                </button>
              </div>
            </div>
          </template>
          <RouterLink v-else to="/auth" class="btn-signin">
            {{ t("nav.login") }}
          </RouterLink>
        </template>

        <!-- Switcher de langue -->
        <div class="lang-toggle">
          <button
            v-for="lang in ['fr', 'en']"
            :key="lang"
            @click.stop="setLocale(lang)"
            :class="['lang-btn', { 'lang-btn--active': locale === lang }]"
          >
            {{ lang.toUpperCase() }}
          </button>
        </div>
      </nav>
    </div>
    <SearchBanner v-if="isFleetRoute" />
  </header>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "../store/auth.js";
import { userAuthStore } from "../store/userAuth.js";
import SearchBanner from "./SearchBanner.vue";

const { t, locale } = useI18n();

function setLocale(lang) {
  locale.value = lang;
  localStorage.setItem("locale", lang);
}

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const menuRef = ref(null);
const mobileOpen = ref(false);

watch(
  () => route.path,
  () => {
    mobileOpen.value = false;
  },
);

const isAdminRoute = computed(() => route.path.startsWith("/admin"));
const isFleetRoute = computed(() => route.path === "/fleet");

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

async function handleAdminLogout() {
  await authStore.logout();
  router.push("/");
}

async function handleUserLogout() {
  menuOpen.value = false;
  await userAuthStore.logout();
  router.push("/");
}
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}
.logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}
.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a2e;
}
.nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Burger */
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 200;
}
.burger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: #1a1a2e;
  border-radius: 2px;
  transition: all 0.25s;
  transform-origin: center;
}
.burger-line:nth-child(1).open {
  transform: translateY(7px) rotate(45deg);
}
.burger-line:nth-child(2).open {
  opacity: 0;
}
.burger-line:nth-child(3).open {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .burger {
    display: flex;
  }
  .nav {
    display: none;
    flex-direction: column;
    align-items: stretch;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #e8ecf5;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    padding: 1rem 1.5rem;
    gap: 0.25rem;
    z-index: 150;
  }
  .nav--open {
    display: flex;
  }
  .nav-link {
    padding: 0.7rem 0.8rem;
    font-size: 1rem;
    border-radius: 8px;
  }
  .btn-signin {
    text-align: center;
    padding: 0.75rem;
    font-size: 0.95rem;
    margin-top: 0.25rem;
  }
  .btn-admin {
    text-align: center;
    padding: 0.75rem;
  }
  .btn-user {
    width: 100%;
    justify-content: space-between;
  }
  .dropdown {
    position: static;
    box-shadow: none;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-top: 0.25rem;
  }
}
.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: background 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  background: #f0f4ff;
  color: #1a1a2e;
}
.user-info {
  font-size: 0.85rem;
  color: #888;
  padding: 0.4rem 0.5rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-logout {
  background: #fce4ec;
  color: #c62828;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-logout:hover {
  background: #f8bbd0;
}
.btn-admin {
  background: #1a1a2e;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  font-size: 0.88rem;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.btn-admin:hover {
  opacity: 0.8;
}
.btn-admin-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.btn-signin {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 0.88rem;
  transition: opacity 0.2s;
}
.btn-signin:hover {
  opacity: 0.9;
}

/* Menu utilisateur */
.user-menu {
  position: relative;
}
.btn-user {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #f0f4ff;
  border: 1.5px solid #dde3f5;
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  font-weight: 600;
  font-size: 0.88rem;
  color: #1a1a2e;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-user:hover {
  background: #e2e8fa;
}
.user-icon {
  width: 18px;
  height: 18px;
  color: #667eea;
  flex-shrink: 0;
}
.user-prenom {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  width: 18px;
  height: 18px;
  color: #888;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.chevron.open {
  transform: rotate(180deg);
}
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 200;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a2e;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
.dropdown-item:hover {
  background: #f5f7ff;
}
.dropdown-item svg {
  width: 16px;
  height: 16px;
  color: #667eea;
  flex-shrink: 0;
}
.dropdown-item.danger {
  color: #c62828;
}
.dropdown-item.danger svg {
  color: #c62828;
}
.dropdown-item.danger:hover {
  background: #fce4ec;
}

/* Language toggle */
.lang-toggle {
  display: flex;
  align-items: center;
  background: #f0f2f8;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.lang-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #8892b0;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    box-shadow 0.18s;
  letter-spacing: 0.05em;
  line-height: 1.5;
}
.lang-btn:hover {
  color: #4a5568;
}
.lang-btn--active {
  background: #fff;
  color: #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
@media (max-width: 768px) {
  .lang-toggle {
    margin-top: 0.25rem;
    justify-content: center;
    align-self: flex-start;
  }
}
</style>
