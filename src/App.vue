<template>
  <a href="#main-content" class="skip-link">{{ t("nav.skipToContent") }}</a>
  <AppHeader />
  <main id="main-content">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <AppToast />

  <Transition name="fade">
    <button
      v-if="showScrollTop"
      class="scroll-top-btn"
      @click="scrollToTop"
      :aria-label="t('nav.scrollToTop')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import AppToast from "./components/AppToast.vue";

const { t, locale } = useI18n();
const route = useRoute();

watch(locale, (lang) => { document.documentElement.lang = lang; }, { immediate: true });

const showScrollTop = ref(false);

function onScroll() {
  showScrollTop.value = window.scrollY > 300;
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: var(--sans, "Segoe UI", system-ui, sans-serif);
  background: #fff;
  color: #1a1a2e;
}

/* Page transition */
.page-enter-active,
.page-leave-active { transition: opacity 0.18s ease; }
.page-enter-from,
.page-leave-to   { opacity: 0; }

/* Fade for scroll-top button */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to   { opacity: 0; }

/* Scroll-to-top button */
.scroll-top-btn {
  position: fixed;
  bottom: 5.5rem;
  right: 1.5rem;
  z-index: 400;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-navy, #1a1a2e);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transition: background 0.2s, transform 0.2s;
}
.scroll-top-btn:hover {
  background: #2d2d5e;
  transform: translateY(-2px);
}
@media (max-width: 480px) {
  .scroll-top-btn { bottom: 1.5rem; right: 1rem; }
}
</style>
