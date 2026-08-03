const BATCH_COLORS = [
  { border: "border-l-sky-400", dot: "bg-sky-400", hex: "#38bdf8" },
  { border: "border-l-orange-400", dot: "bg-orange-400", hex: "#fb923c" },
  { border: "border-l-violet-400", dot: "bg-violet-400", hex: "#a78bfa" },
  { border: "border-l-emerald-400", dot: "bg-emerald-400", hex: "#34d399" },
  { border: "border-l-rose-400", dot: "bg-rose-400", hex: "#fb7185" },
  { border: "border-l-amber-400", dot: "bg-amber-400", hex: "#fbbf24" },
];

export const FILTER_JOB_COLOR = {
  border: "border-l-zinc-400",
  dot: "bg-zinc-400",
  hex: "#a1a1aa",
};

function hashId(id) {
  const value = String(id || "");
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable color for a batch id (same across tables). */
export function getBatchColor(batchId) {
  if (!batchId) return null;
  return BATCH_COLORS[hashId(batchId) % BATCH_COLORS.length];
}

/**
 * Assign colors in batch list order so consecutive batches differ clearly.
 * Falls back to hash if id missing from the ordered list.
 */
export function buildBatchColorMap(batches = []) {
  const map = new Map();
  batches.forEach((batch, index) => {
    if (!batch?.id) return;
    map.set(batch.id, BATCH_COLORS[index % BATCH_COLORS.length]);
  });
  return map;
}

export function resolveBatchColor(batchId, colorMap) {
  if (!batchId) return null;
  if (colorMap?.has(batchId)) return colorMap.get(batchId);
  return getBatchColor(batchId);
}
