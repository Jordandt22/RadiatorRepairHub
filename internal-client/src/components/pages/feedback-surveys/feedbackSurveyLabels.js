export const FORM_TYPE_LABELS = {
  quick_contact: "Quick Contact",
  report_info: "Report Info",
  contact: "Contact",
  get_listed: "Get Listed",
};

export const FOUND_VIA_LABELS = {
  google_search: "Google search",
  referral: "Referral",
  social_media: "Social media",
  other: "Other",
};

export const FOUND_LOOKING_FOR_LABELS = {
  yes: "Yes",
  no: "No",
  partially: "Partially",
};

export function labelFor(map, value) {
  if (!value) return "—";
  return map[value] ?? value;
}
