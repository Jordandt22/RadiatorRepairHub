export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export function formatPosition(value) {
  if (value == null) return "—";
  return Number(value).toFixed(1);
}

export function formatCtr(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function formatPercent(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function positionColorClass(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "text-muted-foreground";
  }
  const position = Number(value);
  if (position <= 3) return "text-emerald-600 dark:text-emerald-400";
  if (position <= 6) return "text-teal-600 dark:text-teal-400";
  if (position <= 12) return "text-amber-600 dark:text-amber-400";
  if (position <= 24) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-500";
}

export function ctrColorClass(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "text-muted-foreground";
  }
  const ctr = Number(value);
  if (ctr >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (ctr >= 4) return "text-teal-600 dark:text-teal-400";
  if (ctr >= 2) return "text-amber-600 dark:text-amber-400";
  if (ctr >= 1) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-500";
}

export function formatRank(rank, total) {
  if (rank == null) return "—";
  if (!total) return `#${rank}`;
  return `#${rank} of ${total}`;
}
