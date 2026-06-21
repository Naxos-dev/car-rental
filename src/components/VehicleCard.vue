<template>
  <div class="vehicle-card">
    <div class="vehicle-img-wrapper">
      <div
        v-if="vehicle.photoURL && !imgFailed && !imgLoaded"
        class="vehicle-img-skeleton"
        aria-hidden="true"
      ></div>
      <span v-if="vehicle.photoURL && !imgFailed && !imgLoaded" class="sr-only">{{ vehicle.marque }} {{ vehicle.modele }} — {{ t('fleet.loading') }}</span>
      <img
        v-if="vehicle.photoURL && !imgFailed"
        :src="cloudinaryThumb(vehicle.photoURL, 480, 360)"
        :alt="`${vehicle.marque} ${vehicle.modele}`"
        class="vehicle-img"
        :class="{ 'vehicle-img--loaded': imgLoaded }"
        @error="imgFailed = true"
        @load="imgLoaded = true"
      />
      <div v-if="!vehicle.photoURL || imgFailed" class="vehicle-img-placeholder" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
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
        <svg v-if="!isDisabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { cloudinaryThumb } from "../utils/cloudinaryUtils.js";

const props = defineProps({
  vehicle: { type: Object, required: true },
  isBlocked: { type: Boolean, default: false },
});

defineEmits(["reserve"]);

const { t, tm } = useI18n();
const imgFailed = ref(false);
const imgLoaded = ref(false);

watch(() => props.vehicle?.photoURL, () => {
  imgLoaded.value = false;
  imgFailed.value = false;
});

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
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.vehicle-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: transform 0.2s;
}
.vehicle-card:hover {
  transform: translateY(-4px);
}
.vehicle-img-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  min-height: 200px;
}
.vehicle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s, opacity 0.25s;
  opacity: 0;
}
.vehicle-img--loaded {
  opacity: 1;
}
.vehicle-img-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f2f8 25%, #e4e8f4 50%, #f0f2f8 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.vehicle-img-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-bg-page, #f8f9ff);
  display: flex;
  align-items: center;
  justify-content: center;
}
.vehicle-img-placeholder svg {
  width: 52px;
  height: 52px;
  color: #c8d0e8;
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
  color: var(--color-navy);
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
  color: var(--color-navy);
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
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.btn-reserve:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
.btn-reserve:disabled {
  background: #e8e8e8;
  color: #999;
  cursor: not-allowed;
}
</style>
