import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../views/LandingPage.vue";
import BackOffice from "../views/BackOffice.vue";
import CheckoutPage from "../views/CheckoutPage.vue";
import PaymentSuccessPage from "../views/PaymentSuccessPage.vue";
import AuthPage from "../views/AuthPage.vue";
import AccountPage from "../views/AccountPage.vue";
import FleetPage from "../views/FleetPage.vue";
import LegalPage from "../views/LegalPage.vue";
import { authStore } from "../store/auth.js";
import { userAuthStore } from "../store/userAuth.js";

const routes = [
  { path: "/", name: "Home", component: LandingPage },
  { path: "/fleet", name: "Fleet", component: FleetPage },
  {
    path: "/cgu",
    name: "Terms",
    component: LegalPage,
    meta: { legalType: "terms" },
  },
  {
    path: "/confidentialite",
    name: "Privacy",
    component: LegalPage,
    meta: { legalType: "privacy" },
  },
  { path: "/auth", name: "Auth", component: AuthPage },
  { path: "/login", redirect: "/auth" },
  {
    path: "/account",
    name: "Account",
    component: AccountPage,
    meta: { requiresUserAuth: true },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: CheckoutPage,
    meta: { requiresUserAuth: true },
  },
  {
    path: "/payment-success",
    name: "PaymentSuccess",
    component: PaymentSuccessPage,
    meta: { requiresUserAuth: true },
  },
  {
    path: "/admin",
    name: "BackOffice",
    component: BackOffice,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  // Attendre que Firebase ait résolu l'état d'authentification
  if (authStore.loading || userAuthStore.loading) {
    await new Promise((resolve) => {
      const stop = setInterval(() => {
        if (!authStore.loading && !userAuthStore.loading) {
          clearInterval(stop);
          resolve();
        }
      }, 50);
    });
  }

  // Garde admin : doit être connecté avec un compte admin
  if (to.meta.requiresAuth && !authStore.isAdmin) {
    return { name: "Auth", query: { redirect: to.fullPath } };
  }

  // Garde client : doit avoir un compte
  if (to.meta.requiresUserAuth && !userAuthStore.isAuthenticated) {
    return { path: "/auth", query: { redirect: to.fullPath } };
  }

  // Redirige si déjà connecté et tente d'accéder à /auth
  if (to.name === "Auth" && userAuthStore.isAuthenticated) {
    return authStore.isAdmin ? { path: "/admin" } : { path: "/account" };
  }
});

export default router;
