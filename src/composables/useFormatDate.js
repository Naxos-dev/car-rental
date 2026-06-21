import { i18n } from "../i18n/index.js";

export function formatDate(value, options) {
  if (!value) return "—";
  const date = value?.toDate
    ? value.toDate()
    : new Date(typeof value === "string" && value.length === 10 ? value + "T00:00:00" : value);
  if (isNaN(date.getTime())) return "—";
  const lang = i18n.global.locale.value === "fr" ? "fr-FR" : "en-GB";
  return date.toLocaleDateString(lang, options ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}
