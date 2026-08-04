const SORT_LABELS = {
  businesses_desc: "Highest # of Businesses",
  businesses_asc: "Lowest # of Businesses",
};

function formatCount(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function locationSortLabel(sort = "businesses_desc") {
  return SORT_LABELS[sort] ?? SORT_LABELS.businesses_desc;
}

export function formatStatesExportText(rows = [], { sort = "businesses_desc" } = {}) {
  const totalBusinesses = rows.reduce(
    (sum, row) => sum + (Number(row.business_count) || 0),
    0
  );

  const lines = [
    "RadiatorRepairHub — State business stats",
    `Generated: ${todayStamp()}`,
    `Sort: ${locationSortLabel(sort)}`,
    `States: ${formatCount(rows.length)}`,
    `Total businesses: ${formatCount(totalBusinesses)}`,
    "",
  ];

  rows.forEach((row, index) => {
    const code = row.code ? ` (${row.code})` : "";
    lines.push(
      `${index + 1}. ${row.name ?? "Unknown"}${code} — ${formatCount(
        row.business_count
      )} businesses (${formatPercent(row.percentage)}), ${formatCount(
        row.city_count
      )} cities, ${formatCount(row.postal_code_count)} postal codes`
    );
  });

  return lines.join("\n");
}

export function formatCitiesExportText(
  rows = [],
  {
    sort = "businesses_desc",
    stateName = null,
    stateCode = null,
    stateBusinessCount = 0,
  } = {}
) {
  const stateLabel = [stateName, stateCode ? `(${stateCode})` : null]
    .filter(Boolean)
    .join(" ");

  const lines = [
    `RadiatorRepairHub — City business stats${
      stateLabel ? ` for ${stateLabel}` : ""
    }`,
    `Generated: ${todayStamp()}`,
    `Sort: ${locationSortLabel(sort)}`,
    `Cities: ${formatCount(rows.length)}`,
    `State businesses: ${formatCount(stateBusinessCount)}`,
    "",
  ];

  rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${row.name ?? "Unknown"} — ${formatCount(
        row.business_count
      )} businesses (${formatPercent(row.percentage)} of state), ${formatCount(
        row.postal_code_count
      )} postal codes`
    );
  });

  return lines.join("\n");
}

export function formatPostalCodesExportText(
  rows = [],
  {
    sort = "businesses_desc",
    cityName = null,
    stateName = null,
    stateCode = null,
    cityBusinessCount = 0,
  } = {}
) {
  const locationLabel = [
    cityName,
    stateCode || stateName
      ? `(${[stateName, stateCode].filter(Boolean).join(", ")})`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const lines = [
    `RadiatorRepairHub — Postal code business stats${
      locationLabel ? ` for ${locationLabel}` : ""
    }`,
    `Generated: ${todayStamp()}`,
    `Sort: ${locationSortLabel(sort)}`,
    `Postal codes: ${formatCount(rows.length)}`,
    `City businesses: ${formatCount(cityBusinessCount)}`,
    "",
  ];

  rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${row.code ?? "Unknown"} — ${formatCount(
        row.business_count
      )} businesses (${formatPercent(row.percentage)} of city)`
    );
  });

  return lines.join("\n");
}
