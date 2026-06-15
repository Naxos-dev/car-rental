<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #fff;
  color: #1a1a2e;
}

/* ── DateRangePicker : alt-input (champ visible généré par flatpickr) ── */
.drp-alt-input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 0.8rem 0.6rem 2.5rem;
  font-size: 0.92rem;
  font-family: inherit;
  color: #1a1a2e;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s;
  line-height: 1.5;
}
.drp-alt-input:focus {
  border-color: #e63946;
  outline: none;
}
.drp-alt-input::placeholder {
  color: #aab0c4;
  font-size: 0.9rem;
}
/* Calendrier attaché au body — z-index > overlay du modal (500) */
.flatpickr-calendar {
  z-index: 9999 !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18) !important;
  border: 1px solid #e8eaf6 !important;
  font-family: "Segoe UI", system-ui, sans-serif !important;
}
/* ── Jours sélectionnés / plage ── */
.flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange {
  background: #e63946 !important;
  border-color: #e63946 !important;
  color: #fff !important;
  font-weight: 700 !important;
}
.flatpickr-day.inRange {
  background: rgba(230, 57, 70, 0.1) !important;
  border-color: transparent !important;
  box-shadow: -5px 0 0 rgba(230, 57, 70, 0.1), 5px 0 0 rgba(230, 57, 70, 0.1) !important;
  color: #1a1a2e !important;
}
.flatpickr-day.startRange.endRange {
  border-radius: 50px !important;
}
.flatpickr-day:hover:not(.disabled):not(.selected):not(.inRange):not(.startRange):not(.endRange) {
  background: rgba(230, 57, 70, 0.07) !important;
  border-color: rgba(230, 57, 70, 0.2) !important;
}
/* ── Dates déjà réservées ── */
.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  opacity: 1 !important;
  color: #a0b0d0 !important;
  background: rgba(37, 99, 235, 0.06) !important;
  border-color: transparent !important;
  text-decoration: line-through !important;
  cursor: not-allowed !important;
}
/* ── Aujourd'hui ── */
.flatpickr-day.today:not(.selected):not(.startRange):not(.endRange) {
  border-color: #e63946 !important;
  font-weight: 700 !important;
  color: #e63946 !important;
}
/* ── Navigation mois ── */
.flatpickr-months .flatpickr-prev-month:hover svg,
.flatpickr-months .flatpickr-next-month:hover svg {
  fill: #e63946 !important;
}
.flatpickr-current-month .numInputWrapper span:hover,
.flatpickr-current-month .flatpickr-monthDropdown-months:focus {
  background: rgba(230, 57, 70, 0.08) !important;
}
</style>
