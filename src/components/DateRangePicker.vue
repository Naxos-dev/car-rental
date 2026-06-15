<template>
  <div class="drp-wrapper">
    <svg
      class="drp-cal-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    <input ref="inputEl" type="text" :placeholder="placeholder" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import flatpickr from "flatpickr";
import { French } from "flatpickr/dist/l10n/fr.js";
import "flatpickr/dist/flatpickr.min.css";
import { useI18n } from "vue-i18n";

const props = defineProps({
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  disabledRanges: { type: Array, default: () => [] },
  placeholder: { type: String, default: "" },
});

const emit = defineEmits(["update:startDate", "update:endDate"]);

const { locale } = useI18n();
const inputEl = ref(null);
let fp = null;

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

onMounted(() => {
  const isFr = locale.value === "fr";

  fp = flatpickr(inputEl.value, {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altInputClass: "drp-alt-input",
    altFormat: isFr ? "j M Y" : "M j, Y",
    locale: isFr ? French : "default",
    minDate: "today",
    showMonths: window.innerWidth >= 640 ? 2 : 1,
    // Le calendrier est attaché au body pour éviter le clipping
    // par le overflow:auto du modal-card
    appendTo: document.body,
    disable: props.disabledRanges,
    defaultDate: [props.startDate, props.endDate].filter(Boolean),
    onChange(dates) {
      emit("update:startDate", dates[0] ? fmt(dates[0]) : "");
      emit("update:endDate", dates[1] ? fmt(dates[1]) : "");
    },
    onDayCreate(_, __, _fp, dayElem) {
      if (dayElem.classList.contains("flatpickr-disabled")) {
        dayElem.title = isFr ? "Déjà réservé" : "Already booked";
      }
    },
    onReady(_, __, fpInstance) {
      // Propager le placeholder sur l'alt-input créé par flatpickr
      if (fpInstance.altInput) {
        fpInstance.altInput.placeholder = props.placeholder;
      }
    },
  });
});

onBeforeUnmount(() => fp?.destroy());

watch(() => props.disabledRanges, (v) => fp?.set("disable", v ?? []), { deep: true });

watch(
  [() => props.startDate, () => props.endDate],
  ([s, e]) => fp?.setDate([s, e].filter(Boolean), false),
);

watch(
  () => props.placeholder,
  (v) => { if (fp?.altInput) fp.altInput.placeholder = v; },
);
</script>

<style scoped>
.drp-wrapper {
  position: relative;
  width: 100%;
}

.drp-cal-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}
</style>
