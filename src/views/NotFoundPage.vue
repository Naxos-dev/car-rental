<template>
  <div class="not-found">
    <div class="not-found-inner">
      <svg
        class="not-found-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h1 class="not-found-code">404</h1>
      <p class="not-found-title">{{ t("notFound.title") }}</p>
      <p class="not-found-desc">{{ t("notFound.description") }}</p>
      <RouterLink to="/" class="btn-home">
        {{ t("notFound.cta") }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page, #f8f9ff);
  padding: 2rem 1.5rem;
}

.not-found-inner {
  text-align: center;
  max-width: 480px;
}

.not-found-icon {
  width: 56px;
  height: 56px;
  color: var(--color-primary, #e63946);
  margin-bottom: 1rem;
}

.not-found-code {
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 800;
  color: var(--color-navy, #1a1a2e);
  line-height: 1;
  margin: 0 0 0.5rem;
}

.not-found-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-navy, #1a1a2e);
  margin: 0 0 0.6rem;
}

.not-found-desc {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary, #e63946);
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  padding: 0.75rem 1.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-home:hover {
  background: var(--color-primary-dark, #c62828);
}
</style>
