// Une période (vehicle.tarifs[]) est { debut: "YYYY-MM-DD", fin: "YYYY-MM-DD", prix: Number }.
// debut/fin sont inclusifs. En cas de chevauchement de périodes, la première trouvée gagne.

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 60 * 60 * 1000;

// Mirrors api/_stripe-helpers.js::calcNbJours (le calcul serveur qui fixe le montant Stripe).
export function calcNbJours(startDate, endDate, startTime = "", endTime = "") {
  if (!startDate || !endDate) return 1;
  const start = new Date(`${startDate}T${startTime || "00:00"}`);
  const end = new Date(`${endDate}T${endTime || "00:00"}`);
  const diff = end - start;
  if (diff <= 0) return 1;
  const wholeDays = Math.floor(diff / DAY_MS);
  const remainder = diff - wholeDays * DAY_MS;
  return Math.max(1, wholeDays + (remainder > GRACE_MS ? 1 : 0));
}

function addDaysToISODate(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getPriceForDate(vehicle, dateStr) {
  const match = (vehicle?.tarifs ?? []).find(
    (t) => t.debut && t.fin && t.debut <= dateStr && dateStr <= t.fin,
  );
  return match ? Number(match.prix) || 0 : Number(vehicle?.prix ?? 0);
}

// Regroupe les jours consécutifs au même prix, pour l'affichage du détail de facturation.
export function getPriceBreakdown(vehicle, startDate, nbJours) {
  const segments = [];
  if (!vehicle || !startDate) return segments;
  for (let i = 0; i < nbJours; i++) {
    const dateStr = i === 0 ? startDate : addDaysToISODate(startDate, i);
    const prix = getPriceForDate(vehicle, dateStr);
    const last = segments[segments.length - 1];
    if (last && last.prix === prix) {
      last.jours += 1;
    } else {
      segments.push({ prix, jours: 1 });
    }
  }
  return segments;
}

export function calculateTotal(vehicle, startDate, nbJours) {
  return Math.round(
    getPriceBreakdown(vehicle, startDate, nbJours).reduce(
      (sum, s) => sum + s.prix * s.jours,
      0,
    ),
  );
}

// Prix moyen par jour pour un séjour donné (utilisé dans la liste des véhicules, avant
// d'arriver sur le récapitulatif détaillé du checkout). Sans dates sélectionnées, retombe
// sur le tarif par défaut du véhicule.
export function getEffectivePricePerDay(vehicle, startDate, endDate, startTime = "", endTime = "") {
  if (!startDate || !endDate) return Number(vehicle?.prix ?? 0);
  const nbJours = calcNbJours(startDate, endDate, startTime, endTime);
  return Math.round(calculateTotal(vehicle, startDate, nbJours) / nbJours);
}

// Deux périodes se chevauchent si l'une commence avant/à la fin de l'autre (bornes incluses).
export function hasOverlappingTarifs(tarifs) {
  const periods = (tarifs ?? []).filter((t) => t.debut && t.fin);
  const sorted = [...periods].sort((a, b) => a.debut.localeCompare(b.debut));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].debut <= sorted[i - 1].fin) return true;
  }
  return false;
}
