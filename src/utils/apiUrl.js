// Derives a sibling API endpoint URL from VITE_CHECKOUT_FUNCTION_URL, so every Stripe/reservation
// endpoint resolves the same way across local Express (:3001) and the Vercel /api/* routes.
export function apiUrl(endpoint) {
  const checkoutUrl = import.meta.env.VITE_CHECKOUT_FUNCTION_URL || "/api/create-checkout-session";
  return checkoutUrl.replace(/\/[^/]+$/, `/${endpoint}`);
}
