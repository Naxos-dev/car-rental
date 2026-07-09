<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg
            class="footer-logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#e63946"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"
            />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          <span class="logo-text">AutoLoc</span>
        </div>
        <p>{{ t("footer.tagline") }}</p>
      </div>

      <div class="footer-links">
        <h4>{{ t("footer.info") }}</h4>
        <ul>
          <li>
            <router-link to="/#about">{{ t("footer.about") }}</router-link>
          </li>
          <li>
            <router-link to="/cgu">{{ t("footer.terms") }}</router-link>
          </li>
          <li>
            <router-link to="/confidentialite">{{
              t("footer.privacy")
            }}</router-link>
          </li>
          <li>
            <router-link to="/#faq">{{ t("footer.faq") }}</router-link>
          </li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>{{ t("footer.contact") }}</h4>
        <a
          class="contact-item"
          href="https://www.google.com/maps/search/?api=1&query=12+rue+de+la+Paix,+Paris"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ouvrir l'adresse dans Google Maps"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          12 rue de la Paix, Paris
        </a>
        <a
          class="contact-item"
          href="tel:+33123456789"
          aria-label="Appeler le 01 23 45 67 89"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
          01 23 45 67 89
        </a>
        <a
          class="contact-item"
          href="mailto:contact@autoloc.fr"
          aria-label="Envoyer un email à contact@autoloc.fr"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          contact@autoloc.fr
        </a>
      </div>
    </div>
    <div class="footer-trust">
      <div class="footer-trust-inner">
        <div class="trust-badges">
          <span class="trust-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {{ t("footer.ssl") }}
          </span>
          <span class="trust-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {{ t("footer.dataProtected") }}
          </span>
        </div>
        <div class="payment-methods">
          <span class="payment-label">{{ t("footer.paymentLabel") }}</span>
          <span class="payment-chip">VISA</span>
          <span class="payment-chip">Mastercard</span>
          <span class="payment-chip stripe">stripe</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} AutoLoc — {{ t("footer.rights") }}</p>
      <p class="dev-signature">
        Developed with ❤️ by
        <a href="/" class="dev-signature-link">Naxos</a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.footer {
  background: var(--color-navy);
  color: #ccc;
  margin-top: 4rem;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 2rem;
}
@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.footer-brand .footer-logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}
.footer-brand .logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}
.footer-brand p {
  margin-top: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.5;
}
.footer-links h4,
.footer-contact h4 {
  color: #fff;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}
.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-links li {
  margin-bottom: 0.4rem;
}
.footer-links a,
.footer-links a.router-link-active,
.footer-links a.router-link-exact-active {
  color: #ccc;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #fff;
}
.footer-contact p,
.footer-contact a {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}
.footer-contact .contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  margin-left: -0.4rem;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  color: #ccc;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}
.footer-contact .contact-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}
.footer-contact .contact-item svg {
  width: 15px;
  height: 15px;
  stroke: #e63946;
  flex-shrink: 0;
}
.footer-trust {
  border-top: 1px solid #2d2d4e;
  padding: 1rem 0;
}
.footer-trust-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.trust-badges {
  display: flex;
  gap: 1.25rem;
}
.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #ccc;
}
.trust-badge svg {
  width: 14px;
  height: 14px;
  stroke: #22c55e;
}
.payment-methods {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.payment-label {
  font-size: 0.78rem;
  color: #aaa;
}
.payment-chip {
  background: #2d2d4e;
  border: 1px solid #3d3d5e;
  color: #ccc;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  letter-spacing: 0.04em;
}
.payment-chip.stripe {
  background: #6772e5;
  border-color: #6772e5;
  color: #fff;
  font-style: italic;
}
.footer-bottom {
  border-top: 1px solid #2d2d4e;
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  color: #888;
}
.dev-signature {
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: #666;
}
.dev-signature-link {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
}
.dev-signature-link:hover {
  color: #fff;
  text-decoration: underline;
}
</style>
