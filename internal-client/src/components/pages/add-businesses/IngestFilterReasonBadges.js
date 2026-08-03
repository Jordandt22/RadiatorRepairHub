import { Badge } from "@/components/ui/badge";

const REASON_STYLES = [
  {
    match: (reason) => reason.startsWith("missing "),
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  {
    match: (reason) => reason.startsWith("totalScore below 3"),
    className: "border-transparent bg-yellow-100 text-yellow-800",
  },
  {
    match: (reason) => reason === "permanently closed",
    className: "border-transparent bg-rose-100 text-rose-800",
  },
  {
    match: (reason) => reason === "temporarily closed",
    className: "border-transparent bg-orange-100 text-orange-800",
  },
  {
    match: (reason) => reason.startsWith("blocked category"),
    className: "border-transparent bg-slate-200 text-slate-800",
  },
  {
    match: (reason) => reason.startsWith("duplicate place id"),
    className: "border-transparent bg-fuchsia-100 text-fuchsia-800",
  },
];

const FALLBACK_CLASS = "border-transparent bg-zinc-100 text-zinc-700";

function styleForReason(reason) {
  return (
    REASON_STYLES.find((entry) => entry.match(reason))?.className ??
    FALLBACK_CLASS
  );
}

function splitReasons(reason) {
  if (!reason || typeof reason !== "string") return [];
  return reason
    .split(", ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatReasonLabel(reason) {
  return reason.charAt(0).toUpperCase() + reason.slice(1);
}

export default function IngestFilterReasonBadges({ reason }) {
  const parts = splitReasons(reason);

  if (parts.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((part) => (
        <Badge
          key={part}
          variant="outline"
          className={styleForReason(part)}
          title={part}
        >
          {formatReasonLabel(part)}
        </Badge>
      ))}
    </div>
  );
}
