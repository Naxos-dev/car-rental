<template>
  <div class="vehicle-card">
    <div class="vehicle-img-wrapper">
      <img
        :src="vehicle.photoURL"
        :alt="`${vehicle.marque} ${vehicle.modele}`"
        class="vehicle-img"
      />
      <span :class="['dispo-badge', badgeClass]">{{ badgeLabel }}</span>
    </div>
    <div class="vehicle-info">
      <h3>{{ vehicle.marque }} {{ vehicle.modele }}</h3>
      <div class="vehicle-tags">
        <span class="tag">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          {{ vehicle.carburant in fuelMap ? fuelMap[vehicle.carburant] : vehicle.carburant }}
        </span>
        <span class="tag">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {{ vehicle.places }} {{ t("fleet.seats") }}
        </span>
        <span class="tag tag--price">{{ vehicle.prix }}{{ t('fleet.perDay') }}</span>
      </div>
      <button
        class="btn-reserve"
        :disabled="isDisabled"
        @click="$emit('reserve', vehicle)"
      >
        {{ btnLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  vehicle: { type: Object, required: true },
  isBlocked: { type: Boolean, default: false },
});

defineEmits(["reserve"]);

const { t, tm } = useI18n();

const fuelMap = computed(() => tm('fuel'));

const isDisabled = computed(() => !props.vehicle.disponible || props.isBlocked);

const badgeClass = computed(() => {
  if (!props.vehicle.disponible) return "dispo-badge--off";
  if (props.isBlocked) return "dispo-badge--reserved";
  return "dispo-badge--on";
});

const badgeLabel = computed(() => {
  if (!props.vehicle.disponible) return t("fleet.unavailable");
  if (props.isBlocked) return t("fleet.reserved");
  return t("fleet.available");
});

const btnLabel = computed(() => {
  if (!props.vehicle.disponible) return t("fleet.unavailable");
  if (props.isBlocked) return t("fleet.alreadyReserved");
  return t("fleet.book");
});
</script>

<style scoped>
.vehicle-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}
.vehicle-card:hover {
  transform: translateY(-4px);
}
.vehicle-img-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.vehicle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.vehicle-card:hover .vehicle-img {
  transform: scale(1.04);
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
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.tag svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
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
</style>
