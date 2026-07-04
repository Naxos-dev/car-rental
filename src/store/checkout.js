import { reactive } from "vue";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 60 * 60 * 1000;

export const checkoutStore = reactive({
  vehicle: null,
  nom: "",
  email: "",
  telephone: "",
  location: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",

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
  },
});
