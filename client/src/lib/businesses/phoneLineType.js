const PUBLIC_PHONE_LINE_TYPE_LABELS = {
  landline: "Landline",
  mobile: "Mobile",
  fixedVoip: "VoIP",
  nonFixedVoip: "VoIP",
  tollFree: "Toll-free",
  personal: "Personal",
};

const PUBLIC_PHONE_LINE_TYPE_NOTES = {
  landline: "Call Only",
  mobile: "Call or Text",
  fixedVoip: "Call or Text",
  nonFixedVoip: "Call or Text",
  tollFree: "Call Only",
};

const PUBLIC_PHONE_LINE_TYPE_TONES = {
  landline: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300",
  mobile: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  fixedVoip: "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-300",
  nonFixedVoip: "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-300",
  tollFree: "bg-amber-100 text-amber-950 dark:bg-amber-500/15 dark:text-amber-200",
  personal: "bg-teal-100 text-teal-900 dark:bg-teal-500/15 dark:text-teal-300",
};

/** Customer-facing label. Unknown and non-callable types stay hidden. */
export function publicPhoneLineTypeLabel(lineType) {
  if (!lineType) return null;
  return PUBLIC_PHONE_LINE_TYPE_LABELS[lineType] ?? null;
}

/** Type plus a shopper note. Personal has no reliable text/call claim. */
export function publicPhoneLineTypeDetail(lineType) {
  const label = publicPhoneLineTypeLabel(lineType);
  if (!label) return null;
  return {
    label,
    note: PUBLIC_PHONE_LINE_TYPE_NOTES[lineType] ?? null,
    tone:
      PUBLIC_PHONE_LINE_TYPE_TONES[lineType] ??
      "bg-muted text-muted-foreground",
  };
}
