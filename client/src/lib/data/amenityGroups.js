export const AMENITY_KEYS = [
  "appointments_recommended",
  "credit_cards",
  "debit_cards",
  "mechanic",
  "nfc_mobile_payments",
  "oil_change",
  "onsite_services",
  "restroom",
  "wheelchair_accessible",
];

export const AMENITY_GROUPS = [
  {
    id: "payment",
    title: "Payment Methods",
    options: [
      { key: "credit_cards", label: "Credit Cards" },
      { key: "debit_cards", label: "Debit Cards" },
      { key: "nfc_mobile_payments", label: "NFC Mobile Payments" },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    options: [
      { key: "wheelchair_accessible", label: "Wheelchair Accessible" },
      { key: "restroom", label: "Restroom" },
    ],
  },
  {
    id: "other",
    title: "Other",
    options: [
      { key: "appointments_recommended", label: "Appointments Recommended" },
      { key: "mechanic", label: "Mechanic" },
      { key: "oil_change", label: "Oil Change" },
      { key: "onsite_services", label: "Onsite Services" },
    ],
  },
];

export function emptyAmenityFlags() {
  return Object.fromEntries(AMENITY_KEYS.map((key) => [key, false]));
}

export function normalizeAmenityFlags(features = {}) {
  const next = emptyAmenityFlags();
  for (const key of AMENITY_KEYS) {
    next[key] = Boolean(features?.[key]);
  }
  return next;
}

export function amenityFlagsEqual(a, b) {
  return AMENITY_KEYS.every((key) => Boolean(a?.[key]) === Boolean(b?.[key]));
}
