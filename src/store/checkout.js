import { reactive } from "vue";

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
    const diff = new Date(this.endDate) - new Date(this.startDate);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  get total() {
    return this.vehicle ? this.nbJours * (this.vehicle.prix ?? 0) : 0;
  },

  clear() {
    this.vehicle = null;
    this.nom = this.email = this.telephone = this.location = "";
    this.startDate = this.startTime = this.endDate = this.endTime = "";
  },
});
