import { reactive } from "vue";

export const searchStore = reactive({
  location: "Lille",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "18:00",
});
