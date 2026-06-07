<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <svg class="footer-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 17H5m14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM5 17a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM3 11l2-6h14l2 6M1 11h22" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">AutoLoc</span>
        <p>{{ t('footer.tagline') }}</p>
      </div>

      <div class="footer-links">
        <h4>{{ t('footer.services') }}</h4>
        <ul>
          <li><a href="#">{{ t('footer.shortRental') }}</a></li>
          <li><a href="#">{{ t('footer.longRental') }}</a></li>
          <li><a href="#">{{ t('footer.utility') }}</a></li>
          <li><a href="#">{{ t('footer.electric') }}</a></li>
        </ul>
      </div>

      <div class="footer-links">
        <h4>{{ t('footer.info') }}</h4>
        <ul>
          <li><a href="#">{{ t('footer.about') }}</a></li>
          <li><a href="#">{{ t('footer.terms') }}</a></li>
          <li><a href="#">{{ t('footer.privacy') }}</a></li>
          <li><a href="#">{{ t('footer.faq') }}</a></li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>{{ t('footer.contact') }}</h4>
        <p class="contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          12 rue de la Paix, Paris
        </p>
        <p class="contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          01 23 45 67 89
        </p>
        <p class="contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          contact@autoloc.fr
        </p>
      </div>
    </div>
    <div class="footer-trust">
      <div class="footer-trust-inner">
        <div class="trust-badges">
          <span class="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {{ t('footer.ssl') }}
          </span>
          <span class="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {{ t('footer.dataProtected') }}
          </span>
        </div>
        <div class="payment-methods">
          <span class="payment-label">{{ t('footer.paymentLabel') }}</span>
          <span class="payment-chip">VISA</span>
          <span class="payment-chip">Mastercard</span>
          <span class="payment-chip stripe">stripe</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} AutoLoc — {{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.footer {
  background: #1a1a2e;
  color: #ccc;
  margin-top: 4rem;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
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
.footer-brand .footer-logo-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 0.2rem;
}
.footer-brand .logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-left: 0.4rem;
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
.footer-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #fff;
}
.footer-contact p {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}
.footer-contact p.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #ccc;
}
.footer-contact p.contact-item svg {
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
  color: #aaa;
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
  color: #888;
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
</style>
