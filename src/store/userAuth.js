import { reactive } from "vue";
import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { setAdminRole } from "./auth.js";

export const userAuthStore = reactive({
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  get isAuthenticated() {
    return !!this.user;
  },

  async register(email, password, prenom, nom) {
    this.error = null;
    localStorage.setItem("authRole", "user");
    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Sauvegarder le profil dans Firestore
      await setDoc(doc(db, "users", cred.user.uid), { prenom, nom, email });
    } catch (err) {
      localStorage.removeItem("authRole");
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async login(email, password) {
    this.error = null;
    localStorage.setItem("authRole", "user");
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      localStorage.removeItem("authRole");
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async logout() {
    localStorage.removeItem("authRole");
    await signOut(auth);
  },

  async updateUserEmail(newEmail, currentPassword) {
    this.error = null;
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
    } catch (err) {
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async updateUserPassword(currentPassword, newPassword) {
    this.error = null;
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err) {
      this.error = mapAuthError(err.code);
      throw err;
    }
  },
});

onAuthStateChanged(auth, async (user) => {
  userAuthStore.user = user;
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    userAuthStore.userProfile = snap.exists() ? snap.data() : null;

    // Restaurer automatiquement le rôle depuis Firestore
    const role = snap.exists() ? snap.data().role : null;
    if (role === "admin") {
      setAdminRole(true);
    } else if (!localStorage.getItem("authRole")) {
      localStorage.setItem("authRole", "user");
    }
  } else {
    userAuthStore.userProfile = null;
  }
  userAuthStore.loading = false;
});

function mapAuthError(code) {
  const messages = {
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
    "auth/weak-password":
      "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
    "auth/invalid-credential": "Identifiants incorrects.",
    "auth/requires-recent-login":
      "Veuillez vous reconnecter pour effectuer cette action.",
  };
  return messages[code] ?? "Une erreur est survenue. Réessayez.";
}
