<template>
  <VueDatePicker
    :input-attrs="inputId ? { id: inputId } : undefined"
    :model-value="range"
    @update:model-value="onChange"
    :range="{ partialRange: false, noDisabledRange: true }"
    :min-date="today"
    :max-date="dynamicMaxDate"
    @range-start="onRangeStart"
    @closed="dynamicMaxDate = null"
    :disabled-dates="isDisabled"
    :time-config="{ enableTimePicker: false }"
    :locale="dpLocale"
    :formats="formats"
    :placeholder="placeholder"
    auto-apply
    :multi-calendars="multiCal"
    teleport
    :ui="ui"
  >
    <template #input-icon>
      <svg
        class="drp-cal-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </template>
  </VueDatePicker>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { fr } from "date-fns/locale";
import { useI18n } from "vue-i18n";

const props = defineProps({
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  disabledRanges: { type: Array, default: () => [] },
  placeholder: { type: String, default: "" },
  inputId: { type: String, default: undefined },
});

const emit = defineEmits(["update:startDate", "update:endDate"]);

const { locale } = useI18n();

const today = new Date();
today.setHours(0, 0, 0, 0);

const windowWidth = ref(window.innerWidth);
function onResize() { windowWidth.value = window.innerWidth; }
onMounted(() => window.addEventListener("resize", onResize, { passive: true }));
onUnmounted(() => window.removeEventListener("resize", onResize));
const multiCal = computed(() => windowWidth.value >= 640);

// date-fns Locale object (undefined = English par défaut)
const dpLocale = computed(() => (locale.value === "fr" ? fr : undefined));

// Formats.input : fonction de formatage de l'input visible
const formats = computed(() => ({
  input: (dates) => {
    if (!Array.isArray(dates) || !dates[0]) return "";
    const lang = locale.value === "fr" ? "fr-FR" : "en-GB";
    const opts = { day: "numeric", month: "short", year: "numeric" };
    const start = dates[0].toLocaleDateString(lang, opts);
    const end = dates[1] ? dates[1].toLocaleDateString(lang, opts) : "…";
    return `${start} – ${end}`;
  },
}));

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const range = computed(() => {
  const s = props.startDate ? new Date(props.startDate + "T00:00:00") : null;
  const e = props.endDate ? new Date(props.endDate + "T00:00:00") : null;
  return s ? [s, e ?? null] : null;
});

function isDisabled(date) {
  return props.disabledRanges.some((r) => {
    const from = new Date(r.from + "T00:00:00");
    const to = new Date(r.to + "T00:00:00");
    return date >= from && date <= to;
  });
}

const dynamicMaxDate = ref(null);

function onRangeStart(date) {
  let earliest = null;
  for (const r of props.disabledRanges) {
    const from = new Date(r.from + "T00:00:00");
    if (from > date && (!earliest || from < earliest)) {
      earliest = from;
    }
  }
  if (earliest) {
    const dayBefore = new Date(earliest);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dynamicMaxDate.value = dayBefore;
  }
}

const ui = {
  input: "drp-input",
  menu: "drp-calendar",
  // Classe spécifique aux réservations futures (pas aux dates passées grisées par min-date)
  dayClass: (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= today && isDisabled(date) ? "drp-reserved" : "";
  },
};

function onChange(val) {
  if (!val || !val[0]) {
    emit("update:startDate", "");
    emit("update:endDate", "");
    return;
  }
  emit("update:startDate", fmt(val[0]));
  emit("update:endDate", val[1] ? fmt(val[1]) : "");
}
</script>

<style scoped>
.drp-cal-icon {
  width: 15px;
  height: 15px;
  color: #9ca3af;
}
</style>
