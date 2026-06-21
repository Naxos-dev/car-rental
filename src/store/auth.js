import { reactive } from "vue";
import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { i18n } from "../i18n/index.js";

function mapAuthError(code) {
  const keys = {
    "auth/invalid-email": "auth.errors.invalidEmail",
    "auth/email-already-in-use": "auth.errors.emailInUse",
    "auth/weak-password": "auth.errors.weakPassword",
    "auth/too-many-requests": "auth.errors.tooManyRequests",
    "auth/invalid-credential": "auth.errors.invalidCredential",
    "auth/requires-recent-login": "auth.errors.requiresRecentLogin",
  };
  return i18n.global.t(keys[code] ?? "auth.errors.default");
}

export const authStore = reactive({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  _isAdmin: false,

  get isAuthenticated() {
    return !!this.user;
  },

  get isAdmin() {
    return this._isAdmin;
  },

  async register(email, password, prenom, nom, telephone = "") {
    this.error = null;
    localStorage.setItem("autoloc_authRole", "user");
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      localStorage.removeItem("autoloc_authRole");
      this.error = mapAuthError(err.code);
      throw err;
    }
    try {
      await setDoc(doc(db, "users", cred.user.uid), { prenom, nom, email, telephone });
    } catch (err) {
      // Auth user was created; profile write failed (network/quota).
      // Keep autoloc_authRole so the session stays valid — onAuthStateChanged will retry the profile read.
      console.error("[register] Failed to create Firestore profile:", err.message);
    }
  },

  async login(email, password) {
    this.error = null;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : null;
      if (role === "admin") {
        this._isAdmin = true;
        localStorage.setItem("autoloc_authRole", "admin");
      } else {
        localStorage.setItem("autoloc_authRole", "user");
      }
      return role;
    } catch (err) {
      localStorage.removeItem("autoloc_authRole");
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async loginWithGoogle() {
    this.error = null;
    const provider = new GoogleAuthProvider();
    let cred;
    try {
      cred = await signInWithPopup(auth, provider);
    } catch (err) {
      const cancelled = [
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/user-cancelled",
      ];
      if (!cancelled.includes(err.code)) {
        localStorage.removeItem("autoloc_authRole");
        this.error = mapAuthError(err.code);
      }
      throw err;
    }

    // signInWithPopup succeeded — set provisional role immediately so auth state
    // is consistent even if the subsequent Firestore profile read/write fails.
    localStorage.setItem("autoloc_authRole", "user");

    try {
      let snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        const displayName = cred.user.displayName || "";
        const [prenom = "", ...rest] = displayName.split(" ");
        const nom = rest.join(" ");
        await setDoc(doc(db, "users", cred.user.uid), {
          prenom,
          nom,
          email: cred.user.email,
          telephone: "",
        });
        // Re-read after creation so that a pre-seeded role is picked up in this session.
        snap = await getDoc(doc(db, "users", cred.user.uid));
      }
      const role = snap.exists() ? snap.data().role : null;
      if (role === "admin") {
        this._isAdmin = true;
        localStorage.setItem("autoloc_authRole", "admin");
      }
      return role;
    } catch (err) {
      // Firestore profile read/write failed — auth remains valid with default "user" role.
      // onAuthStateChanged will recover the profile on the next auth event.
      console.error("[loginWithGoogle] Firestore profile error:", err.message);
      return null;
    }
  },

  async logout() {
    localStorage.removeItem("autoloc_authRole");
    this._isAdmin = false;
    await signOut(auth);
  },

  async resetPassword(email) {
    this.error = null;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async updateUserEmail(newEmail, currentPassword) {
    this.error = null;
    try {
      const user = auth.currentUser;
      if (!user) throw Object.assign(new Error(), { code: "auth/requires-recent-login" });
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
    } catch (err) {
      this.error = mapAuthError(err.code);
      throw err;
    }
  },

  async updateUserPassword(currentPassword, newPassword) {
    this.error = null;
    try {
      const user = auth.currentUser;
      if (!user) throw Object.assign(new Error(), { code: "auth/requires-recent-login" });
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err) {
      this.error = mapAuthError(err.code);
      throw err;
    }
  },
});

onAuthStateChanged(auth, async (user) => {
  if (user?.uid !== authStore.user?.uid) authStore.loading = true;
  authStore.user = user;
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    let profile = snap.exists() ? snap.data() : null;
    // Sync email in Firestore if it changed after verifyBeforeUpdateEmail confirmation.
    if (profile && profile.email !== user.email) {
      try {
        await updateDoc(doc(db, "users", user.uid), { email: user.email });
        profile = { ...profile, email: user.email };
      } catch (e) {
        console.error("[onAuthStateChanged] Failed to sync email:", e.message);
      }
    }
    authStore.userProfile = profile;
    const role = profile?.role ?? null;
    if (role === "admin") {
      authStore._isAdmin = true;
      localStorage.setItem("autoloc_authRole", "admin");
    } else if (!localStorage.getItem("autoloc_authRole")) {
      localStorage.setItem("autoloc_authRole", "user");
    }
  } else {
    authStore.userProfile = null;
    authStore._isAdmin = false;
    localStorage.removeItem("autoloc_authRole");
  }
  authStore.loading = false;
});
