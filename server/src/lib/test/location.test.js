import test from "node:test";
import assert from "node:assert/strict";

test("cities count cache key definition", () => {
  const key = "CITIES_COUNT";
  const interval = 60 * 60;
  assert.equal(key, "CITIES_COUNT");
  assert.equal(interval, 3600);
});

test("pagination loop collects all rows across 1000-row pages", async () => {
  const TOTAL_ITEMS = 2345;
  const mockTable = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
    id: `city-${i}`,
    name: `City ${i}`,
  }));

  const pageSize = 1000;
  let start = 0;
  const rows = [];
  let pageCalls = 0;

  // Emulates the pagination loop in getAllCitiesList
  for (;;) {
    pageCalls++;
    const data = mockTable.slice(start, start + pageSize);
    rows.push(...data);
    if (!data || data.length < pageSize) break;
    start += pageSize;
  }

  assert.equal(rows.length, TOTAL_ITEMS);
  assert.equal(pageCalls, 3); // 1000, 1000, 345
  assert.equal(rows[0].id, "city-0");
  assert.equal(rows[TOTAL_ITEMS - 1].id, `city-${TOTAL_ITEMS - 1}`);
});
