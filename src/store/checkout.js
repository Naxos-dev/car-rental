import { reactive, watch } from "vue";
import { calculateTotal, calcNbJours } from "../utils/pricing.js";

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
    return calcNbJours(this.startDate, this.endDate, this.startTime, this.endTime);
  },

  get total() {
    if (!this.vehicle || !this.startDate) return 0;
    return calculateTotal(this.vehicle, this.startDate, this.nbJours);
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
