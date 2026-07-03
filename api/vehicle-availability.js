import { getVehicleReservedRanges, checkRateLimit, setCors } from "./_stripe-helpers.js";

const VEHICLE_ID_RE = /^[\w-]{1,128}$/;

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (checkRateLimit(req, { max: 60, windowMs: 60_000 })) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez plus tard." });
  }

  const vehicleId = req.query?.vehicleId;
  if (!vehicleId || !VEHICLE_ID_RE.test(vehicleId)) {
    return res.status(400).json({ error: "vehicleId invalide" });
  }

  try {
    const ranges = await getVehicleReservedRanges(vehicleId);
    res.json({ ranges });
  } catch (err) {
    console.error("Vehicle availability error:", err);
    res.status(503).json({ error: "Service temporairement indisponible. Réessayez dans quelques instants." });
  }
}
