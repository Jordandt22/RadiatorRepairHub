export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
  });
}

export function formatFullDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}
