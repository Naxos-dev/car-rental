import { reactive } from "vue";
import { db } from "../firebase.js";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export const reservationStore = reactive({
  reservations: [],
  loading: true,

  async addReservation(data) {
    const { statut: dataStatut, ...rest } = data;
    await addDoc(collection(db, "reservations"), {
      ...rest,
      statut: dataStatut ?? "en_attente",
      createdAt: serverTimestamp(),
    });
  },

  async updateStatut(id, statut) {
    await updateDoc(doc(db, "reservations", id), { statut });
  },
});

const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  reservationStore.reservations = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  reservationStore.loading = false;
});
