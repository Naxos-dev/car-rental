import { reactive } from "vue";
import { auth } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

export const authStore = reactive({
  user: null,
  loading: true,
  error: null,
  _isAdmin: false,

  get isAuthenticated() {
    return !!this.user;
  },

  get isAdmin() {
    return this._isAdmin;
  },

  async login(email, password) {
    this.error = null;
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("authRole", "admin");
      this._isAdmin = true;
    } catch (err) {
      this.error = mapFirebaseError(err.code);
      throw err;
    }
  },

  async logout() {
    localStorage.removeItem("authRole");
    this._isAdmin = false;
    await signOut(auth);
  },
});

// Synchronise l'état Firebase avec le store en temps réel
onAuthStateChanged(auth, (user) => {
  authStore.user = user;
  if (!user) {
    localStorage.removeItem("authRole");
    authStore._isAdmin = false;
  }
  // _isAdmin sera mis à jour par userAuthStore.onAuthStateChanged via setAdminRole()
  authStore.loading = false;
});

// Appelé par userAuthStore quand le profil Firestore est chargé
export function setAdminRole(isAdmin) {
  authStore._isAdmin = isAdmin;
  if (isAdmin) {
    localStorage.setItem("authRole", "admin");
  }
}

function mapFirebaseError(code) {
  const messages = {
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
    "auth/invalid-credential": "Identifiants incorrects.",
  };
  return messages[code] ?? "Une erreur est survenue. Réessayez.";
}
