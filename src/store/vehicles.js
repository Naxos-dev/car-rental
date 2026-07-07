import { reactive } from "vue";
import { db } from "../firebase.js";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function normalizeTarifs(tarifs) {
  if (!Array.isArray(tarifs)) return [];
  return tarifs
    .filter((t) => t.debut && t.fin)
    .map((t) => ({ debut: t.debut, fin: t.fin, prix: Number(t.prix) || 0 }));
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Échec de l'upload Cloudinary");
  const data = await res.json();
  return data.secure_url;
}

export const vehicleStore = reactive({
  vehicles: [],
  loading: true,

  async addVehicle(data, photoFile) {
    let photoURL = "";
    if (photoFile) {
      photoURL = await uploadToCloudinary(photoFile);
    }
    await addDoc(collection(db, "vehicles"), {
      marque: data.marque,
      modele: data.modele,
      carburant: data.carburant,
      places: data.places,
      prix: data.prix ?? 0,
      lieu: data.lieu,
      tarifs: normalizeTarifs(data.tarifs),
      photoURL,
      disponible: true,
      createdAt: serverTimestamp(),
    });
  },

  async updateVehicle(id, data, photoFile) {
    let photoURL = data.photoURL ?? "";
    if (photoFile) {
      photoURL = await uploadToCloudinary(photoFile);
    }
    await updateDoc(doc(db, "vehicles", id), {
      marque: data.marque,
      modele: data.modele,
      carburant: data.carburant,
      places: data.places,
      prix: data.prix ?? 0,
      lieu: data.lieu,
      tarifs: normalizeTarifs(data.tarifs),
      photoURL,
    });
  },

  async deleteVehicle(id) {
    await deleteDoc(doc(db, "vehicles", id));
  },

  async toggleDisponible(id, current) {
    await updateDoc(doc(db, "vehicles", id), { disponible: !current });
  },
});

const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  vehicleStore.vehicles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  vehicleStore.loading = false;
});
