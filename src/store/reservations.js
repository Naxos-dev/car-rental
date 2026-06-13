import { reactive } from "vue";
import { db } from "../firebase.js";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export const reservationStore = reactive({
  reservations: [],
  loading: true,

  async addReservation(data) {
    const { statut: dataStatut, ...rest } = data;
    await addDoc(collection(db, "reservations"), {
      ...rest,
      statut: dataStatut ?? "confirmee",
      createdAt: serverTimestamp(),
    });
  },

  async updateStatut(id, statut) {
    await updateDoc(doc(db, "reservations", id), { statut });
  },

  async _moveToArchive(id, data, reason) {
    await setDoc(doc(db, "reservations_archived", id), {
      ...data,
      archiveReason: reason,
      archivedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, "reservations", id));
  },

  async deleteReservation(id) {
    const snap = await getDoc(doc(db, "reservations", id));
    if (snap.exists()) await this._moveToArchive(id, snap.data(), "deleted");
  },

  async archivePastReservations() {
    const today = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "reservations"), where("endDate", "<", today));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => this._moveToArchive(d.id, d.data(), "past")));
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

reservationStore.archivePastReservations();
