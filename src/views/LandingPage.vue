<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {{ t("hero.badge") }}
        </div>
        <h1 class="hero-title">
          {{ t("hero.title") }}
        </h1>
        <p class="hero-subtitle">
          {{ t("hero.subtitle") }}
        </p>
        <BookingWidget />
      </div>
    </section>

    <!-- Trust Strip -->
    <section class="trust-strip">
      <div class="container">
        <div class="trust-items">
          <div class="trust-item" v-for="t in trustItems" :key="t.label">
            <span class="trust-icon" v-html="t.svg"></span>
            <span>{{ t.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card" v-for="s in stats" :key="s.number">
            <span class="stat-number">{{ s.number }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Avantages -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">{{ t("features.title") }}</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feat in features" :key="feat.title">
            <div class="feat-icon-wrap" v-html="feat.svg"></div>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Flotte -->
    <section class="fleet" id="fleet">
      <div class="container">
        <h2 class="section-title">{{ t("fleet.title") }}</h2>
        <div v-if="vehicleStore.loading" class="fleet-loading">
          {{ t("fleet.loading") }}
        </div>
        <div v-else-if="vehicles.length === 0" class="fleet-empty">
          {{ t("fleet.empty") }}
        </div>
        <div class="fleet-grid" v-else>
          <VehicleCard
            v-for="v in vehicles"
            :key="v.id"
            :vehicle="v"
            :isBlocked="isDateBlocked(v.id)"
            @reserve="openReservation"
          />
        </div>
      </div>
    </section>

    <ReservationModal
      :vehicle="selectedVehicle"
      :visible="!!selectedVehicle"
      @close="selectedVehicle = null"
    />

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="container">
        <h2 class="section-title">{{ t("testimonials.title") }}</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="t in testimonials" :key="t.name">
            <div class="stars">
              <svg
                v-for="i in 5"
                :key="i"
                viewBox="0 0 24 24"
                fill="#f59e0b"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </div>
            <p class="testimonial-text">"{{ t.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.initials }}</div>
              <div class="author-info">
                <strong>{{ t.name }}</strong>
                <span>{{ t.city }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>{{ t("cta.title") }}</h2>
        <p>{{ t("cta.desc") }}</p>
        <RouterLink to="/fleet" class="btn-cta">{{ t("cta.btn") }}</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BookingWidget from "../components/BookingWidget.vue";
import ReservationModal from "../components/ReservationModal.vue";
import VehicleCard from "../components/VehicleCard.vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import { searchStore } from "../store/search.js";
import { userAuthStore } from "../store/userAuth.js";

const { t, tm } = useI18n();
const router = useRouter();
const vehicles = computed(() => vehicleStore.vehicles);

const unavailableVehicleIds = computed(() => {
  if (!searchStore.startDate || !searchStore.endDate) return new Set();
  const selStart = new Date(searchStore.startDate);
  const selEnd = new Date(searchStore.endDate);
  return new Set(
    reservationStore.reservations
      .filter(
        (r) =>
          ["payee", "confirmee"].includes(r.statut) &&
          new Date(r.startDate) <= selEnd &&
          new Date(r.endDate) >= selStart,
      )
      .map((r) => r.vehicleId),
  );
});

function isDateBlocked(id) {
  return unavailableVehicleIds.value.has(id);
}
const selectedVehicle = ref(null);

function openReservation(vehicle) {
  if (!userAuthStore.isAuthenticated) {
    router.push({ path: "/auth", query: { redirect: "/" } });
    return;
  }
  selectedVehicle.value = vehicle;
}

const trustItems = computed(() => [
  {
    label: t("trustStrip.securePayment"),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  },
  {
    label: t("trustStrip.insurance"),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    label: t("trustStrip.noFees"),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  },
  {
    label: t("trustStrip.support"),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  },
]);

const stats = computed(() => [
  {
    number: t("statsSection.clients.number"),
    label: t("statsSection.clients.label"),
  },
  {
    number: t("statsSection.vehicles.number"),
    label: t("statsSection.vehicles.label"),
  },
  {
    number: t("statsSection.experience.number"),
    label: t("statsSection.experience.label"),
  },
  {
    number: t("statsSection.rating.number"),
    label: t("statsSection.rating.label"),
  },
]);

const features = computed(() => [
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    title: t("featuresSection[0].title"),
    desc: t("featuresSection[0].desc"),
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5m14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM5 17a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM3 11l2-6h14l2 6"/></svg>`,
    title: t("featuresSection[1].title"),
    desc: t("featuresSection[1].desc"),
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M4 14h12M19 6.5C17.5 4.5 15.3 3.5 13 3.5C8.9 3.5 5.5 7.1 5.5 12s3.4 8.5 7.5 8.5c2.3 0 4.5-1 6-3"/></svg>`,
    title: t("featuresSection[2].title"),
    desc: t("featuresSection[2].desc"),
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: t("featuresSection[3].title"),
    desc: t("featuresSection[3].desc"),
  },
]);

const testimonials = computed(() => tm("testimonialsData"));
</script>

<style scoped>
/* Hero */
.hero {
  position: relative;
  min-height: 580px;
  background: url("https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600")
    center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 30, 0.58);
}
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}
.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}
.hero-subtitle {
  color: #ddd;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }
  .hero-subtitle {
    font-size: 0.95rem;
  }
}

/* ── Responsive global ── */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.4rem;
    margin-bottom: 1.75rem;
  }

  /* Trust strip */
  .trust-items {
    gap: 0.85rem 1.5rem;
    justify-content: flex-start;
    padding: 0 1rem;
  }
  .trust-item {
    font-size: 0.8rem;
  }

  /* Stats */
  .stats-section {
    padding: 2.5rem 0;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  .stat-number {
    font-size: 1.8rem;
  }

  /* Features */
  .features {
    padding: 3rem 0;
  }
  .features-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .feature-card {
    padding: 1.5rem 1rem;
  }

  /* Fleet */
  .fleet {
    padding: 3rem 0;
  }
  .fleet-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  /* Testimonials */
  .testimonials {
    padding: 3rem 0;
  }
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  /* CTA */
  .cta {
    padding: 3rem 1rem;
  }
  .cta h2 {
    font-size: 1.5rem;
  }
  .cta p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .fleet-grid {
    grid-template-columns: 1fr;
  }
  .trust-items {
    flex-direction: column;
    gap: 0.6rem;
  }
}

/* Shared */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 2.5rem;
}

/* Features */
.features {
  padding: 5rem 0;
  background: #f8f9ff;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.feature-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.feat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #e63946, #ff6b6b);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.feat-icon-wrap :deep(svg) {
  width: 26px;
  height: 26px;
  stroke: #fff;
}
.feature-card h3 {
  margin: 0.8rem 0 0.4rem;
  color: #1a1a2e;
  font-size: 1rem;
}
.feature-card p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Fleet */
.fleet {
  padding: 5rem 0;
}
.fleet-loading,
.fleet-empty {
  text-align: center;
  color: #999;
  padding: 3rem;
}
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Hero Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  margin-bottom: 0.25rem;
}
.hero-badge svg {
  width: 14px;
  height: 14px;
}

/* Trust Strip */
.trust-strip {
  background: #fff;
  border-bottom: 1px solid #e8ecf5;
  padding: 1.1rem 0;
}
.trust-items {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: #444;
}
.trust-icon {
  display: flex;
  align-items: center;
  color: #e63946;
}
.trust-icon :deep(svg) {
  width: 17px;
  height: 17px;
}

/* Stats */
.stats-section {
  background: linear-gradient(135deg, #1a1a2e, #2d2d5e);
  padding: 3.5rem 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  text-align: center;
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.stat-label {
  font-size: 0.82rem;
  color: #9999bb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Testimonials */
.testimonials {
  padding: 5rem 0;
  background: #f8f9ff;
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.testimonial-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
}
.stars {
  display: flex;
  gap: 0.15rem;
  margin-bottom: 0.75rem;
}
.stars svg {
  width: 16px;
  height: 16px;
}
.testimonial-text {
  color: #444;
  font-size: 0.93rem;
  line-height: 1.6;
  margin: 0 0 1.25rem;
  font-style: italic;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-info strong {
  font-size: 0.92rem;
  color: #1a1a2e;
}
.author-info span {
  font-size: 0.8rem;
  color: #888;
}

/* CTA */
.cta {
  background: linear-gradient(135deg, #1a1a2e, #e63946);
  color: #fff;
  padding: 5rem 0;
  text-align: center;
}
.cta h2 {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}
.cta p {
  font-size: 1.1rem;
  opacity: 0.85;
  margin-bottom: 2rem;
}
.btn-cta {
  background: #fff;
  color: #e63946;
  padding: 0.85rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: transform 0.2s;
  display: inline-block;
}
.btn-cta:hover {
  transform: scale(1.04);
}
</style>
