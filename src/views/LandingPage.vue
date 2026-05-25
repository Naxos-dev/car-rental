<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          Louez votre véhicule<br />en toute simplicité
        </h1>
        <p class="hero-subtitle">
          Des centaines de véhicules disponibles partout en France
        </p>
        <BookingWidget />
      </div>
    </section>

    <!-- Avantages -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Pourquoi choisir AutoLoc ?</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feat in features" :key="feat.icon">
            <span class="feat-icon">{{ feat.icon }}</span>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Flotte -->
    <section class="fleet" id="fleet">
      <div class="container">
        <h2 class="section-title">Notre flotte</h2>
        <div v-if="vehicleStore.loading" class="fleet-loading">
          Chargement des véhicules...
        </div>
        <div v-else-if="vehicles.length === 0" class="fleet-empty">
          Aucun véhicule disponible pour le moment.
        </div>
        <div class="fleet-grid" v-else>
          <div class="vehicle-card" v-for="v in vehicles" :key="v.id">
            <div class="vehicle-img-wrapper">
              <img
                :src="v.photoURL"
                :alt="`${v.marque} ${v.modele}`"
                class="vehicle-img"
              />
              <span
                :class="[
                  'dispo-badge',
                  !v.disponible
                    ? 'dispo-badge--off'
                    : isDateBlocked(v.id)
                      ? 'dispo-badge--reserved'
                      : 'dispo-badge--on',
                ]"
              >
                {{
                  !v.disponible
                    ? "🔴 Indisponible"
                    : isDateBlocked(v.id)
                      ? "📅 Réservé"
                      : "✅ Disponible"
                }}
              </span>
            </div>
            <div class="vehicle-info">
              <h3>{{ v.marque }} {{ v.modele }}</h3>
              <div class="vehicle-tags">
                <span class="tag">⛽ {{ v.carburant }}</span>
                <span class="tag">👥 {{ v.places }} places</span>
                <span class="tag tag--price">💶 {{ v.prix }}€/jour</span>
              </div>
              <button
                class="btn-reserve"
                :disabled="!v.disponible || isDateBlocked(v.id)"
                @click="openReservation(v)"
              >
                {{
                  !v.disponible
                    ? "Indisponible"
                    : isDateBlocked(v.id)
                      ? "Déjà réservé"
                      : "Réserver"
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ReservationModal
      :vehicle="selectedVehicle"
      :visible="!!selectedVehicle"
      @close="selectedVehicle = null"
    />

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>Prêt à prendre la route ?</h2>
        <p>Réservez en ligne en moins de 2 minutes, sans frais cachés.</p>
        <a href="#" class="btn-cta">Voir tous nos véhicules</a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import BookingWidget from "../components/BookingWidget.vue";
import ReservationModal from "../components/ReservationModal.vue";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import { searchStore } from "../store/search.js";
import { userAuthStore } from "../store/userAuth.js";

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

const features = [
  {
    icon: "✅",
    title: "Réservation instantanée",
    desc: "Confirmez votre réservation en quelques clics, 24h/24 et 7j/7.",
  },
  {
    icon: "🔑",
    title: "Large choix",
    desc: "Citadines, SUV, électriques, utilitaires — nous avons le véhicule qu'il vous faut.",
  },
  {
    icon: "💰",
    title: "Prix transparents",
    desc: "Aucun frais caché. Le prix affiché est le prix payé.",
  },
  {
    icon: "🛡️",
    title: "Assurance incluse",
    desc: "Tous nos véhicules sont couverts par une assurance tous risques.",
  },
];
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
.feat-icon {
  font-size: 2rem;
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
.vehicle-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}
.vehicle-card:hover {
  transform: translateY(-4px);
}
.vehicle-img-wrapper {
  position: relative;
}
.vehicle-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
.dispo-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.dispo-badge--on {
  background: rgba(46, 125, 50, 0.9);
  color: #fff;
}
.dispo-badge--off {
  background: rgba(198, 40, 40, 0.85);
  color: #fff;
}
.dispo-badge--reserved {
  background: rgba(37, 99, 235, 0.85);
  color: #fff;
}
.vehicle-info {
  padding: 1.2rem;
}
.vehicle-info h3 {
  margin: 0 0 0.6rem;
  color: #1a1a2e;
  font-size: 1.05rem;
}
.vehicle-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.tag {
  background: #f0f4ff;
  color: #1a1a2e;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.tag--price {
  background: #fff3e0;
  color: #e65100;
}
.btn-reserve {
  width: 100%;
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-reserve:hover:not(:disabled) {
  background: #c1121f;
}
.btn-reserve:disabled {
  background: #ccc;
  cursor: not-allowed;
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
