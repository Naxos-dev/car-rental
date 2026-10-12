# Autoloc

Application web de location de véhicules : réservation et paiement en ligne, espace administrateur.

## Démo

https://autoloc-project.vercel.app

## Fonctionnalités

### Côté client

- Recherche par lieu, dates et horaires de prise en charge (page d'accueil et catalogue)
- Catalogue des véhicules avec filtres (lieu, marque, carburant, nombre de places, prix maximum)
- Fiche véhicule avec calendrier des dates déjà réservées
- Authentification par email/mot de passe ou compte Google, réinitialisation de mot de passe
- Espace client : historique des réservations (en cours et archivées), modification des informations du compte (nom, téléphone, email, mot de passe)
- Paiement en ligne par carte via Stripe Checkout, page de confirmation après paiement
- Email de confirmation de réservation
- Interface en français et en anglais

### Côté administrateur (`/admin`)

- Gestion du catalogue de véhicules (ajout, modification, suppression, photo, disponibilité, tarifs saisonniers)
- Gestion des réservations : liste et vue calendrier, changement de statut, suppression (archivage)
- Création manuelle d'une réservation « agence » (sans paiement en ligne), avec envoi de l'email de confirmation
- Archivage automatique des réservations passées

Les lieux de prise en charge (`locations`) sont gérés directement dans la console Firestore : il n'existe pas d'interface d'administration pour cette collection.

## Stack

- **Frontend** : Vue 3 + Vite, Vue Router 4, Vue I18n (FR/EN), FullCalendar (vue de calendrier admin), @vuepic/vue-datepicker + date-fns (sélection de dates)
- **API** : fonctions serverless Vercel (`api/`), rejouées en local via un serveur Express (`server.js`)
- **Firebase** : Authentification (email/mot de passe, Google) et Firestore (synchronisation temps réel, règles de sécurité)
- **Stripe** : Checkout pour le paiement, webhook pour la confirmation de réservation
- **Cloudinary** : hébergement des photos de véhicules
- **Resend** : envoi des emails de confirmation de réservation et des alertes d'incident

## Architecture — flux de réservation

1. Le client choisit un véhicule et des dates, puis `CheckoutPage` appelle `POST /api/create-checkout-session`.
2. Le serveur recalcule le prix à partir du document Firestore du véhicule et revérifie la disponibilité — jamais à partir d'une valeur envoyée par le client — puis crée une session Stripe Checkout.
3. Le client paie sur la page hébergée par Stripe, puis est redirigé vers `/payment-success`.
4. Stripe notifie en parallèle `POST /api/stripe-webhook` (signature vérifiée) sur l'évènement `checkout.session.completed`. C'est ce webhook qui écrit le document `reservations`, via le SDK Admin Firebase.
5. Les règles Firestore interdisent à un client la création directe d'un document `reservations` (`allow create: if isAdmin();`) : seul le webhook (SDK Admin, qui contourne les règles) ou un administrateur (réservation agence) peuvent en créer un.

## Sécurité

- Les rôles (`admin` / client) sont vérifiés par les règles Firestore (`isAdmin()` relit `users/{uid}.role`), jamais à partir d'une donnée envoyée par le client.
- Le champ `role` ne peut être ni défini à l'inscription ni modifié par l'utilisateur lui-même.
- La création de réservations est réservée aux administrateurs / au SDK Admin — un client ne peut pas créer de fausse réservation qui bloquerait un véhicule sans payer.
- Le prix et la disponibilité sont toujours recalculés côté serveur avant la création d'une session Stripe.
- La signature du webhook Stripe est vérifiée (`stripe.webhooks.constructEvent`).
- CORS restreint par liste blanche d'origines (`ALLOWED_ORIGINS`).
- Limitation de débit (rate limiting) par IP sur les endpoints sensibles.
- Politique de sécurité du contenu (CSP) définie dans `index.html`.
- `/api/send-reservation-email` exige un ID token Firebase d'administrateur ; le contenu de l'email est relu depuis Firestore plutôt que fourni par la requête.

## Installation en local

### Prérequis

- Node.js `^20.19.0` ou `>=22.12.0` (requis par Vite 8)
- Un projet Firebase (Authentication + Firestore)
- Un compte Stripe (le mode test suffit)
- Un compte Cloudinary
- Un compte Resend (optionnel — sans clé, la réservation est tout de même enregistrée, l'email n'est simplement pas envoyé)

### Installation

```bash
npm install
cp .env.example .env.local
```

### Variables d'environnement (`.env.local`)

| Variable | Rôle |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` | Configuration du projet Firebase (web) — console Firebase → Paramètres du projet → Config du SDK. Publique par nature. |
| `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload des photos de véhicules côté client |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe — serveur uniquement |
| `VITE_CHECKOUT_FUNCTION_URL` | Laisser la valeur par défaut (`/api/create-checkout-session`) |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook (tableau de bord Stripe, ou sortie de `stripe listen` en local) |
| `ALLOWED_ORIGINS` | Origines autorisées en production (CORS / `cancel_url` Stripe), séparées par des virgules. Laisser vide en local. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Clé de compte de service Firebase Admin, encodée en base64 |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Envoi de l'email de confirmation (optionnel) |
| `ADMIN_ALERT_EMAIL` | Destinataire des alertes d'incident (optionnel) |

### Lancer l'application

```bash
npm run dev       # frontend — http://localhost:5173
npm run dev:api   # API locale (Stripe, Firestore côté serveur…) — http://localhost:3001
```

Les deux doivent tourner en parallèle (le frontend proxifie `/api/*` vers le serveur local).

### Configuration Firebase

1. Créer un projet Firebase, activer Authentication (fournisseurs Email/Password et Google) et Firestore.
2. Déployer les règles du fichier [`firestore.rules`](firestore.rules) (console Firebase → Firestore → Règles).
3. Générer une clé de compte de service (Paramètres du projet → Comptes de service → Générer une nouvelle clé privée), l'encoder en base64 et la renseigner dans `FIREBASE_SERVICE_ACCOUNT_KEY`.
4. Créer manuellement au moins un document dans la collection `locations` (champs `nom`, `adresse`) — nécessaire pour que le catalogue et les réservations fonctionnent, voir [Fonctionnalités](#fonctionnalités).

### Premier compte administrateur

Le rôle `admin` ne peut pas être défini depuis le client : les règles Firestore l'interdisent aussi bien à l'inscription qu'à une modification par l'utilisateur lui-même.

1. Créer un compte normalement depuis `/auth`.
2. Dans la console Firebase → Firestore → collection `users` → document de cet utilisateur (son uid), ajouter manuellement le champ `role` avec la valeur `"admin"`.
3. Se reconnecter : le compte accède alors à `/admin`.

### Configuration Stripe

- Mode test : utiliser les clés `pk_test_...` / `sk_test_...` de votre compte Stripe.
- Webhook en local : `stripe listen --forward-to localhost:3001/stripe-webhook`, puis copier le secret affiché dans `STRIPE_WEBHOOK_SECRET`.

### Configuration Cloudinary

Créer un upload preset, puis renseigner son nom et le nom du cloud dans `.env.local`.

## Tester le paiement

En mode test Stripe, utiliser le numéro de carte `4242 4242 4242 4242`, une date d'expiration future quelconque, et n'importe quel CVC.

## Compte de démo

Un compte client est disponible sur l'environnement de démo (jamais de rôle administrateur) :

- email : `client.demo@example.com`
- mot de passe : `Demo1234!`

## Licence

MIT — voir [LICENSE](LICENSE).
