import { fetchApi } from "@/lib/api/fetchApi";

export const ISSUE_LABEL_TO_ENUM = {
  Overheating: "overheating",
  "Coolant leak": "coolant_leak",
  "Radiator fan not working": "radiator_fan_not_working",
  "Strange noise or vibration": "strange_noise_or_vibration",
  "Low/discolored coolant": "low_discolored_coolant",
  "Radiator Replacement / Repair": "radiator_replacement_repair",
  "Routine Maintenance / Flush": "routine_maintenance_flush",
  Other: "other",
};

export async function submitQuickContact(payload) {
  return fetchApi("/contact-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
