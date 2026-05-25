<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo-icon">🚗</span>
        <span class="logo-text">AutoLoc</span>
        <p>Votre partenaire de location de voiture depuis 2010.</p>
      </div>

      <div class="footer-links">
        <h4>Services</h4>
        <ul>
          <li><a href="#">Location courte durée</a></li>
          <li><a href="#">Location longue durée</a></li>
          <li><a href="#">Véhicules utilitaires</a></li>
          <li><a href="#">Véhicules électriques</a></li>
        </ul>
      </div>

      <div class="footer-links">
        <h4>Informations</h4>
        <ul>
          <li><a href="#">À propos</a></li>
          <li><a href="#">Conditions générales</a></li>
          <li><a href="#">Politique de confidentialité</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>Contact</h4>
        <p>📍 12 rue de la Paix, Paris</p>
        <p>📞 01 23 45 67 89</p>
        <p>✉️ contact@autoloc.fr</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} AutoLoc — Tous droits réservés</p>
    </div>
  </footer>
</template>

<script setup></script>

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
.footer-brand .logo-icon {
  font-size: 1.4rem;
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
.footer-bottom {
  border-top: 1px solid #2d2d4e;
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  color: #888;
}
</style>
