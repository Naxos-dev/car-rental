import { reactive } from "vue";
import { auth } from "../firebase.js";
import { signOut, onAuthStateChanged } from "firebase/auth";

export const authStore = reactive({
  user: null,
  loading: true,
  _isAdmin: false,

  get isAuthenticated() {
    return !!this.user;
  },

  get isAdmin() {
    return this._isAdmin;
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
