import { reactive, watch } from "vue";

const STORAGE_KEY = "autoloc_checkout";

function loadPersisted() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 60 * 60 * 1000;

export const checkoutStore = reactive({
  vehicle: persisted?.vehicle ?? null,
  nom: persisted?.nom ?? "",
  email: persisted?.email ?? "",
  telephone: persisted?.telephone ?? "",
  location: persisted?.location ?? "",
  startDate: persisted?.startDate ?? "",
  startTime: persisted?.startTime ?? "",
  endDate: persisted?.endDate ?? "",
  endTime: persisted?.endTime ?? "",

  get nbJours() {
    if (!this.startDate || !this.endDate) return 1;
    const start = new Date(`${this.startDate}T${this.startTime || "00:00"}`);
    const end = new Date(`${this.endDate}T${this.endTime || "00:00"}`);
    const diff = end - start;
    if (diff <= 0) return 1;
    const wholeDays = Math.floor(diff / DAY_MS);
    const remainder = diff - wholeDays * DAY_MS;
    return Math.max(1, wholeDays + (remainder > GRACE_MS ? 1 : 0));
  },

  get total() {
    return this.vehicle ? Math.round(this.nbJours * (this.vehicle.prix ?? 0)) : 0;
  },

  clear() {
    this.vehicle = null;
    this.nom = this.email = this.telephone = this.location = "";
    this.startDate = this.startTime = this.endDate = this.endTime = "";
    sessionStorage.removeItem(STORAGE_KEY);
  },
});

// Persiste l'état à chaque changement pour survivre à un F5 sur /checkout
// (le garde de routeur redirige sinon vers /fleet, cf. router/index.js).
watch(
  () => ({
    vehicle: checkoutStore.vehicle,
    nom: checkoutStore.nom,
    email: checkoutStore.email,
    telephone: checkoutStore.telephone,
    location: checkoutStore.location,
    startDate: checkoutStore.startDate,
    startTime: checkoutStore.startTime,
    endDate: checkoutStore.endDate,
    endTime: checkoutStore.endTime,
  }),
  (state) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  { deep: true, flush: "sync" }
);
