import { getAdminDb } from "./_firebase-admin.js";

const RESEND_API_URL = "https://api.resend.com/emails";

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// The customer only ever picks a location by name (see src/store/locations.js) — the precise
// address is looked up here, server-side, purely for the confirmation email. Best-effort: an
// unresolved or missing address just omits the "Adresse" row rather than failing the email.
async function fetchLocationAddress(nom) {
  if (!nom) return "";
  try {
    const db = getAdminDb();
    const snap = await db.collection("locations").where("nom", "==", nom).limit(1).get();
    return snap.empty ? "" : (snap.docs[0].data().adresse || "");
  } catch (err) {
    console.error("[email] Erreur récupération adresse du lieu:", err.message);
    return "";
  }
}

function buildReservationEmailHtml({ reservationId, nom, vehicleLabel, startDate, startTime, endDate, endTime, location, adresse, amount }) {
  const rows = [
    ["Référence", reservationId],
    ["Véhicule", vehicleLabel],
    ["Départ", `${formatDate(startDate)}${startTime ? ` à ${startTime}` : ""}`],
    ["Retour", `${formatDate(endDate)}${endTime ? ` à ${endTime}` : ""}`],
    ["Lieu de prise en charge", location],
    ["Adresse", adresse],
    ...(amount ? [["Total", `${amount.toFixed(2)} €`]] : []),
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => (
      `<tr><td style="padding:6px 12px;color:#666;">${escapeHtml(label)}</td><td style="padding:6px 12px;font-weight:600;">${escapeHtml(value)}</td></tr>`
    ))
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>Réservation confirmée${nom ? ` — ${escapeHtml(nom)}` : ""}</h2>
      <p>Voici le détail de votre réservation :</p>
      <table style="border-collapse:collapse;width:100%;">${rows}</table>
      <p style="margin-top:24px;color:#666;font-size:14px;">Merci de votre confiance.</p>
    </div>
  `;
}

// Low-level Resend call shared by the customer confirmation and the admin alert. Returns
// true/false instead of throwing — callers decide what "the email failed" means for them
// (e.g. the confirmation email escalates to an admin alert; the alert itself just logs).
async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY / RESEND_FROM_EMAIL non configurées — email non envoyé.");
    return false;
  }
  try {
    const resp = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!resp.ok) {
      console.error("[email] Échec envoi Resend:", resp.status, await resp.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Erreur envoi email:", err.message);
    return false;
  }
}

// Notifies the operator of an incident (payment captured but reservation not recorded,
// confirmation email that failed to send, etc). Uses the same Resend account as the customer
// email, so a full Resend outage takes both down — that gap is logged to console as a last
// resort, but genuine "is the mail provider itself up" monitoring needs an external service.
export async function sendAdminAlertEmail({ subject, message }) {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) {
    console.warn("[email] ADMIN_ALERT_EMAIL non configurée — alerte non envoyée:", subject);
    return;
  }
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>${escapeHtml(subject)}</h2>
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;
  const ok = await sendViaResend({ to, subject: `[Alerte Autoloc] ${subject}`, html });
  if (!ok) console.error("[email] Échec envoi alerte admin:", subject, "—", message);
}

// Best-effort: a failure here must never block reservation creation, so every error path
// logs and returns instead of throwing. On failure it also pages the admin, since a customer
// silently not receiving their reservation confirmation is exactly the kind of incident that
// needs a human to notice.
export async function sendReservationConfirmationEmail({
  to, reservationId, nom, vehicleLabel, startDate, startTime, endDate, endTime, location, amount,
}) {
  if (!to) {
    console.warn("[email] Aucune adresse email fournie pour la réservation — email non envoyé.");
    return;
  }

  const adresse = await fetchLocationAddress(location);

  const ok = await sendViaResend({
    to,
    subject: `Confirmation de réservation — ${vehicleLabel || "Autoloc"}`,
    html: buildReservationEmailHtml({ reservationId, nom, vehicleLabel, startDate, startTime, endDate, endTime, location, adresse, amount }),
  });

  if (!ok) {
    await sendAdminAlertEmail({
      subject: "Échec d'envoi d'un email de confirmation",
      message: `L'email de confirmation n'a pas pu être envoyé à ${to}.\n\nRéférence: ${reservationId || "—"}\nVéhicule: ${vehicleLabel}\nClient: ${nom || "—"}\nDates: ${formatDate(startDate)} → ${formatDate(endDate)}\n\nPensez à contacter le client manuellement.`,
    });
  }
}
