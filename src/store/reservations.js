import { reactive, watch } from "vue";
import { db } from "../firebase.js";
import { useToast } from "../composables/useToast.js";
import { authStore } from "./auth.js";
import { i18n } from "../i18n/index.js";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  doc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export const reservationStore = reactive({
  reservations: [],
  archivedReservations: [],
  loading: true,

  // Throws with err.code === "AVAILABILITY_ERROR" if the vehicle is already booked for the period.
  async _assertAvailable(vehicleId, startDate, endDate) {
    const q = query(collection(db, "reservations"), where("vehicleId", "==", vehicleId));
    const snap = await getDocs(q);
    const conflict = snap.docs.some((d) => {
      const r = d.data();
      // Treat a reservation with missing dates as always conflicting (corrupted doc).
      if (!r.startDate || !r.endDate) return r.statut !== "annulee";
      return r.statut !== "annulee" && r.startDate <= endDate && r.endDate >= startDate;
    });
    if (conflict) {
      const err = new Error("VEHICLE_UNAVAILABLE");
      err.code = "AVAILABILITY_ERROR";
      throw err;
    }
  },

  async addReservation(data) {
    if (data.vehicleId && data.startDate && data.endDate) {
      await this._assertAvailable(data.vehicleId, data.startDate, data.endDate);
    }
    const { statut: dataStatut, ...rest } = data;
    const docRef = await addDoc(collection(db, "reservations"), {
      ...rest,
      statut: dataStatut ?? "confirmee",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateStatut(id, statut) {
    await updateDoc(doc(db, "reservations", id), { statut });
  },

  async _moveToArchive(id, data, reason) {
    const srcRef = doc(db, "reservations", id);
    const dstRef = doc(db, "reservations_archived", id);
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(srcRef);
      if (!existing.exists()) return;
      tx.set(dstRef, {
        ...data,
        archiveReason: reason,
        archivedAt: serverTimestamp(),
      });
      tx.delete(srcRef);
    });
  },

  async deleteReservation(id) {
    const snap = await getDoc(doc(db, "reservations", id));
    if (snap.exists()) await this._moveToArchive(id, snap.data(), "deleted");
  },

  async archivePastReservations() {
    // Throttle: run at most once every 6 hours to avoid N Firestore writes on each admin login.
    // Timestamp is written before async work so concurrent tabs see it immediately.
    // On failure it is cleared so the next admin visit can retry.
    const THROTTLE_MS = 6 * 60 * 60 * 1000;
    const lastRun = Number(localStorage.getItem("_archiveLastRun") || 0);
    if (Date.now() - lastRun < THROTTLE_MS) return;
    localStorage.setItem("_archiveLastRun", String(Date.now()));

    try {
      const today = new Date().toISOString().split("T")[0];
      const q = query(collection(db, "reservations"), where("endDate", "<=", today));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        await Promise.all(snap.docs.map((d) => this._moveToArchive(d.id, d.data(), "past")));
        const { show } = useToast();
        show(i18n.global.t("backoffice.archiveDone", { count: snap.docs.length }), "info");
      }
    } catch (err) {
      localStorage.removeItem("_archiveLastRun");
      console.error("[archivePastReservations] Failed:", err.message);
    }
  },
});

let unsubReservations = null;
let unsubArchived = null;
let authGeneration = 0;

// Reuses the profile already fetched by auth.js — no redundant getDoc(users/{uid}).
// auth.js resets authStore.loading to true at the start of every onAuthStateChanged event,
// so the watch waits until loading is false before reading _isAdmin.
watch(
  [() => authStore.user?.uid ?? null, () => authStore.loading],
  ([uid, loading]) => {
    if (unsubReservations) { unsubReservations(); unsubReservations = null; }
    if (unsubArchived) { unsubArchived(); unsubArchived = null; }

    const gen = ++authGeneration;

    if (loading) return;

    if (!uid) {
      reservationStore.reservations = [];
      reservationStore.archivedReservations = [];
      reservationStore.loading = false;
      return;
    }

    reservationStore.loading = true;

    const loadingTimer = setTimeout(() => {
      if (gen === authGeneration) reservationStore.loading = false;
    }, 10_000);
    const clearTimer = () => clearTimeout(loadingTimer);

    const isAdmin = authStore._isAdmin;

    if (isAdmin) {
      unsubReservations = onSnapshot(
        query(collection(db, "reservations"), orderBy("createdAt", "desc")),
        (snapshot) => {
          clearTimer();
          if (gen !== authGeneration) return;
          reservationStore.reservations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          reservationStore.loading = false;
        },
        () => { clearTimer(); if (gen === authGeneration) reservationStore.loading = false; }
      );
      unsubArchived = onSnapshot(
        query(collection(db, "reservations_archived"), orderBy("createdAt", "desc")),
        (snapshot) => {
          if (gen !== authGeneration) return;
          reservationStore.archivedReservations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      );
      reservationStore.archivePastReservations();
    } else {
      unsubReservations = onSnapshot(
        query(collection(db, "reservations"), where("userId", "==", uid), orderBy("createdAt", "desc")),
        (snapshot) => {
          clearTimer();
          if (gen !== authGeneration) return;
          reservationStore.reservations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          reservationStore.loading = false;
        },
        () => { clearTimer(); if (gen === authGeneration) reservationStore.loading = false; }
      );
      unsubArchived = onSnapshot(
        query(collection(db, "reservations_archived"), where("userId", "==", uid), orderBy("createdAt", "desc")),
        (snapshot) => {
          if (gen !== authGeneration) return;
          reservationStore.archivedReservations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      );
    }
  },
  { immediate: true }
);
