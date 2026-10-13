const PUBLIC_PHONE_LINE_TYPE_LABELS = {
  landline: "Landline",
  mobile: "Mobile",
  fixedVoip: "VoIP",
  nonFixedVoip: "VoIP",
  tollFree: "Toll-free",
  personal: "Personal",
};

/** Customer-facing label. Unknown and non-callable types stay hidden. */
export function publicPhoneLineTypeLabel(lineType) {
  if (!lineType) return null;
  return PUBLIC_PHONE_LINE_TYPE_LABELS[lineType] ?? null;
}
