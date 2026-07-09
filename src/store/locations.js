import { reactive } from "vue";
import { db } from "../firebase.js";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// Pickup locations ({ nom, adresse }) — read-only from the app. Documents are added/edited
// directly in the Firestore console (no admin UI for this yet). Only `nom` is ever shown or
// selected client-side; `adresse` is resolved server-side for the confirmation email only
// (see api/_email-helpers.js::fetchLocationAddress).
export const locationStore = reactive({
  locations: [],
  loading: true,
});

const q = query(collection(db, "locations"), orderBy("nom"));
onSnapshot(
  q,
  (snapshot) => {
    locationStore.locations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    locationStore.loading = false;
  },
  () => { locationStore.loading = false; }
);
