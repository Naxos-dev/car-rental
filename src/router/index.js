import { createRouter, createWebHistory } from "vue-router";
import { watch } from "vue";
import LandingPage from "../views/LandingPage.vue";
import BackOffice from "../views/BackOffice.vue";
import CheckoutPage from "../views/CheckoutPage.vue";
import PaymentSuccessPage from "../views/PaymentSuccessPage.vue";
import AuthPage from "../views/AuthPage.vue";
import AccountPage from "../views/AccountPage.vue";
import FleetPage from "../views/FleetPage.vue";
import LegalPage from "../views/LegalPage.vue";
import NotFoundPage from "../views/NotFoundPage.vue";
import { authStore } from "../store/auth.js";
import { checkoutStore } from "../store/checkout.js";

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
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundPage },
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
  // Attendre que Firebase ait résolu l'état d'authentification (max 5s)
  if (authStore.loading) {
    await new Promise((resolve) => {
      const stop = watch(
        () => authStore.loading,
        (loading) => { if (!loading) { stop(); resolve(); } }
      );
      setTimeout(() => { stop(); resolve(); }, 5000);
    });
  }

  // Garde admin : doit être connecté avec un compte admin
  if (to.meta.requiresAuth && !authStore.isAdmin) {
    return { name: "Auth", query: { redirect: to.fullPath } };
  }

  // Garde client : doit avoir un compte (non-admin uniquement)
  if (to.meta.requiresUserAuth && (!authStore.isAuthenticated || authStore.isAdmin)) {
    return authStore.isAdmin ? { path: "/admin" } : { path: "/auth", query: { redirect: to.fullPath } };
  }

  // Garde checkout : redirige si aucun véhicule sélectionné
  if (to.name === "Checkout" && !checkoutStore.vehicle) {
    return { path: "/fleet", query: { redirected: "1" } };
  }

  // Redirige si déjà connecté et tente d'accéder à /auth
  if (to.name === "Auth" && authStore.isAuthenticated) {
    return authStore.isAdmin ? { path: "/admin" } : { path: "/account" };
  }
});

export default router;
