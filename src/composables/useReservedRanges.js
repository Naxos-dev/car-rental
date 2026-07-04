import { ref } from "vue";
import { apiUrl } from "../utils/apiUrl.js";

// Reserved date ranges for every vehicle, via the public availability endpoint (Admin SDK
// server-side). Needed because reservationStore, for a non-admin client, only ever contains
// that client's own reservations (Firestore rules restrict reads to their owner).
export function useReservedRanges() {
  const ranges = ref([]);

  async function fetchAll() {
    try {
      const res = await fetch(apiUrl("vehicle-availability"));
      if (!res.ok) throw new Error("fetch failed");
      const { ranges: data } = await res.json();
      ranges.value = data;
    } catch (err) {
      console.error("[useReservedRanges] Erreur récupération disponibilité:", err);
      ranges.value = [];
    }
  }

  return { ranges, fetchAll };
}
