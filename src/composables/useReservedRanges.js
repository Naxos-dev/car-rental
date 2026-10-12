import { ref } from "vue";
import { apiUrl } from "../utils/apiUrl.js";
import { useToast } from "./useToast.js";
import { i18n } from "../i18n/index.js";

async function fetchRanges() {
  const res = await fetch(apiUrl("vehicle-availability"));
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const { ranges } = await res.json();
  return ranges;
}

// Reserved date ranges for every vehicle, via the public availability endpoint (Admin SDK
// server-side). Needed because reservationStore, for a non-admin client, only ever contains
// that client's own reservations (Firestore rules restrict reads to their owner).
//
// On failure, ranges is left untouched rather than reset to [] — silently treating "we
// couldn't check" as "nothing is reserved" would make fully-booked vehicles look available.
// One retry absorbs transient blips (rate limit, cold start); a persistent failure surfaces
// a toast so the user knows the list may be stale. The server still re-validates availability
// at booking time either way, so this can't cause an actual double-booking — it's a display bug.
export function useReservedRanges() {
  const ranges = ref([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      ranges.value = await fetchRanges();
    } catch {
      try {
        ranges.value = await fetchRanges();
      } catch (err) {
        console.error("[useReservedRanges] Erreur récupération disponibilité:", err);
        const { show } = useToast();
        show(i18n.global.t("common.availabilityCheckFailed"), "error");
      }
    } finally {
      loading.value = false;
    }
  }

  return { ranges, loading, fetchAll };
}
