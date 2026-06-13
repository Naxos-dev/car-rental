<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-back">
        <router-link to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ t("legal.backHome") }}
        </router-link>
      </div>

      <!-- CGU -->
      <template v-if="type === 'terms'">
        <h1>{{ t("legal.terms.title") }}</h1>
        <p class="legal-date">{{ t("legal.lastUpdated") }} : 01/06/2026</p>

        <section>
          <h2>1. {{ t("legal.terms.s1.title") }}</h2>
          <p>{{ t("legal.terms.s1.content") }}</p>
        </section>

        <section>
          <h2>2. {{ t("legal.terms.s2.title") }}</h2>
          <p>{{ t("legal.terms.s2.content") }}</p>
        </section>

        <section>
          <h2>3. {{ t("legal.terms.s3.title") }}</h2>
          <p>{{ t("legal.terms.s3.content") }}</p>
        </section>

        <section>
          <h2>4. {{ t("legal.terms.s4.title") }}</h2>
          <p>{{ t("legal.terms.s4.content") }}</p>
        </section>

        <section>
          <h2>5. {{ t("legal.terms.s5.title") }}</h2>
          <p>{{ t("legal.terms.s5.content") }}</p>
        </section>

        <section>
          <h2>6. {{ t("legal.terms.s6.title") }}</h2>
          <p>{{ t("legal.terms.s6.content") }}</p>
        </section>
      </template>

      <!-- Politique de confidentialité -->
      <template v-else-if="type === 'privacy'">
        <h1>{{ t("legal.privacy.title") }}</h1>
        <p class="legal-date">{{ t("legal.lastUpdated") }} : 01/06/2026</p>

        <section>
          <h2>1. {{ t("legal.privacy.s1.title") }}</h2>
          <p>{{ t("legal.privacy.s1.content") }}</p>
        </section>

        <section>
          <h2>2. {{ t("legal.privacy.s2.title") }}</h2>
          <p>{{ t("legal.privacy.s2.content") }}</p>
        </section>

        <section>
          <h2>3. {{ t("legal.privacy.s3.title") }}</h2>
          <p>{{ t("legal.privacy.s3.content") }}</p>
        </section>

        <section>
          <h2>4. {{ t("legal.privacy.s4.title") }}</h2>
          <p>{{ t("legal.privacy.s4.content") }}</p>
        </section>

        <section>
          <h2>5. {{ t("legal.privacy.s5.title") }}</h2>
          <p>{{ t("legal.privacy.s5.content") }}</p>
        </section>

        <section>
          <h2>6. {{ t("legal.privacy.s6.title") }}</h2>
          <p>{{ t("legal.privacy.s6.content") }}</p>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

const type = computed(() => route.meta.legalType);
</script>

<style scoped>
.legal-page {
  background: #f9f9f9;
  min-height: 100vh;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.legal-back {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #e63946;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}
.back-link:hover {
  opacity: 0.75;
}
.back-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.4rem;
}

.legal-date {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 2.5rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.6rem;
  border-left: 3px solid #e63946;
  padding-left: 0.75rem;
}

p {
  color: #444;
  line-height: 1.75;
  font-size: 0.95rem;
}
</style>
