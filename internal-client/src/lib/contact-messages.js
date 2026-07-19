export const ISSUE_LABELS = {
  overheating: "Overheating",
  coolant_leak: "Coolant leak",
  radiator_fan_not_working: "Radiator fan not working",
  strange_noise_or_vibration: "Strange noise or vibration",
  low_discolored_coolant: "Low/discolored coolant",
  radiator_replacement_repair: "Radiator Replacement / Repair",
  routine_maintenance_flush: "Routine Maintenance / Flush",
  other: "Other",
};

export const ISSUE_BADGE_CLASSES = {
  overheating: "border-transparent bg-red-100 text-red-800",
  coolant_leak: "border-transparent bg-sky-100 text-sky-800",
  radiator_fan_not_working: "border-transparent bg-amber-100 text-amber-800",
  strange_noise_or_vibration: "border-transparent bg-teal-100 text-teal-800",
  low_discolored_coolant: "border-transparent bg-lime-100 text-lime-800",
  radiator_replacement_repair: "border-transparent bg-orange-100 text-orange-800",
  routine_maintenance_flush: "border-transparent bg-emerald-100 text-emerald-800",
  other: "border-transparent bg-zinc-100 text-zinc-700",
};

export const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  sent: "Sent",
  declined: "Declined",
  no_response: "No Response",
  flagged: "Flagged",
};

export const STATUS_BADGE_CLASSES = {
  pending: "border-transparent bg-amber-100 text-amber-800",
  approved: "border-transparent bg-blue-100 text-blue-800",
  sent: "border-transparent bg-emerald-100 text-emerald-800",
  declined: "border-transparent bg-red-100 text-red-800",
  no_response: "border-transparent bg-zinc-100 text-zinc-700",
  flagged: "border-transparent bg-orange-100 text-orange-800",
};

export const URGENCY_LABELS = {
  1: "ASAP",
  2: "Can Wait",
};

export const URGENCY_BADGE_CLASSES = {
  1: "border-transparent bg-red-100 text-red-800",
  2: "border-transparent bg-zinc-100 text-zinc-700",
};

export const CONFIRMATION_BADGE_CLASSES = {
  true: "border-transparent bg-emerald-100 text-emerald-800",
  false: "border-transparent bg-zinc-100 text-zinc-700",
};

export function formatIssueLabel(issue) {
  return ISSUE_LABELS[issue] || issue || "—";
}

export function formatStatusLabel(status) {
  return STATUS_LABELS[status] || status || "—";
}

export function formatUrgencyLabel(urgency) {
  return URGENCY_LABELS[urgency] || urgency || "—";
}

export function formatConfirmationLabel(confirmationSent) {
  return confirmationSent ? "Confirmed" : "Unconfirmed";
}
