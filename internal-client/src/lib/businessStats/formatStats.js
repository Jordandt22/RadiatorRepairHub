export function formatPhoneClickTimestamp(iso, now = new Date()) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const absolute = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return absolute;

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return `Just now · ${absolute}`;
  if (minutes < 60) {
    return `${minutes}m ago · ${absolute}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago · ${absolute}`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago · ${absolute}`;
  }
  return absolute;
}
