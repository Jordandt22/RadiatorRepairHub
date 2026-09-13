/**
 * Shared category blocklists for ingest filtering and DB cleanup.
 * Exact names are matched case-insensitively against Google category labels.
 */

/** Substrings matched against categoryName + categories (home HVAC false positives). */
export const CATEGORY_BLOCKLIST = [
  "hvac",
  "heating contractor",
  "furnace",
  "boiler",
  "plumber",
  "plumbing",
  "hydronic",
  "home heating",
  "residential heating",
  "radiator installation",
  "water heater",
];

/**
 * Exact names that are clearly not auto radiator / cooling repair.
 * Used to:
 * - reject ingest when primary categoryName matches
 * - delete unclaimed businesses when primary matches
 * - unlink when used as a secondary category
 *
 * Intentionally excludes labels Google often puts on real radiator /
 * parts companies as primary: Manufacturer, Corporate office,
 * Distribution service, Store, Warehouse, Wholesaler.
 */
export const BLOCKED_EXACT_CATEGORIES = [
  // Food / leisure / attractions
  "American restaurant",
  "Bar",
  "Cafe",
  "Car racing venue",
  "Donut shop",
  "Fast food restaurant",
  "History museum",
  "Memorial",
  "Mobile caterer",
  "Museum",
  "Off roading area",
  "Pizza restaurant",
  "Restaurant",
  "Tourist attraction",
  "Wedding service",

  // Medical / people / civic / education
  "Appraiser",
  "Community college",
  "Department of motor vehicles",
  "Department of Transportation",
  "Doctor",
  "Foreign consulate",
  "Home help",
  "Notary public",
  "Registration office",
  "Sanitary inspection",
  "School bus service",
  "State government office",
  "Technical school",
  "University",

  // Insurance / finance
  "Auto insurance agency",
  "Car finance and loan company",
  "Financial institution",
  "Home insurance agency",
  "Insurance agency",
  "Insurance company",
  "Superannuation consultant",
  "Title company",
  "Transcription service",
  "Travel agency",

  // Home / building / remodel
  "Aluminum window",
  "Apartment rental agency",
  "Appliance repair service",
  "Awning supplier",
  "Bathroom remodeler",
  "Bathroom supply store",
  "Building materials supplier",
  "Building restoration service",
  "Cabinet maker",
  "Carport and pergola builder",
  "Cleaning service",
  "Construction company",
  "Contractor",
  "Door supplier",
  "Drainage service",
  "Dry wall contractor",
  "Fire damage restoration service",
  "Fireplace store",
  "Furniture maker",
  "Furniture repair shop",
  "Furniture store",
  "Handyman/Handywoman/Handyperson",
  "Home goods store",
  "Home improvement store",
  "Home inspector",
  "Hot tub repair service",
  "Insulation materials store",
  "Interior construction contractor",
  "Kitchen remodeler",
  "Landscaping supply store",
  "Painter",
  "Painting",
  "Plumber",
  "Plumbing supply store",
  "PVC windows supplier",
  "Remodeler",
  "Screen repair service",
  "Sheet metal contractor",
  "Shower door shop",
  "Snow removal service",
  "Tile contractor",
  "Water damage restoration service",
  "Window installation service",
  "Window supplier",
  "Window treatment store",
  "Woodworker",

  // Home HVAC / plumbing / gas (not auto)
  "Air conditioning contractor",
  "Air duct cleaning service",
  "Cooling plant",
  "Gas company",
  "Gas engineer",
  "Gas installation service",
  "Heating contractor",
  "HVAC contractor",
  "Mechanical contractor",
  "Mechanical plant",

  // Unrelated retail / services
  "ATM",
  "Bicycle Shop",
  "Boot repair shop",
  "Clothing store",
  "Computer repair service",
  "Computer service",
  "Consignment shop",
  "Convenience store",
  "Electronics company",
  "Electronics repair shop",
  "Electronics store",
  "Embroidery shop",
  "Emergency locksmith service",
  "Fabric product manufacturer",
  "Farm",
  "Fire alarm supplier",
  "Forestry service",
  "Garbage collection service",
  "Gift shop",
  "Hobby store",
  "Ice supplier",
  "Key duplication service",
  "Lamp repair service",
  "Light bulb supplier",
  "Locksmith",
  "Logistics service",
  "Men's clothing store",
  "Mobile network operator",
  "Mobile phone repair shop",
  "Moving supply store",
  "Oil & natural gas company",
  "Oil and gas exploration service",
  "Oilfield",
  "Outlet store",
  "Paint store",
  "Parking lot",
  "Parking lot for motorcycles",
  "Radio broadcaster",
  "Recycling drop-off location",
  "Sanitation service",
  "Second hand store",
  "Security service",
  "Security system installation service",
  "Security system supplier",
  "Smoke shop",
  "Solar energy equipment supplier",
  "Tobacco shop",
  "Toy store",
  "Vaporizer store",
  "Water cooler supplier",
  "Wheelchair repair service",
  "Wheelchair store",
  "Women's clothing store",

  // Aviation / misc non-auto
  "Airplane",
];

/**
 * Extra labels to unlink as secondaries only (never delete a business for these).
 * Includes Google labels that often land on real auto / radiator shops as primary.
 */
export const SECONDARY_UNLINK_EXTRA_CATEGORIES = [
  "Automation company",
  "Business to business service",
  "Chauffeur service",
  "Consultant",
  "Corporate office",
  "Delivery service",
  "Distribution service",
  "Do-it-yourself shop",
  "E-commerce service",
  "Electrical engineer",
  "Engineer",
  "Engineering consultant",
  "Fabrication engineer",
  "Hardware store",
  "Manufacturer",
  "Mechanical engineer",
  "Professional services",
  "Store",
  "Warehouse",
  "Wholesaler",
];

/** All names that should be removed as secondary category links. */
export const SECONDARY_UNLINK_CATEGORIES = [
  ...BLOCKED_EXACT_CATEGORIES,
  ...SECONDARY_UNLINK_EXTRA_CATEGORIES,
];

export const BLOCKED_EXACT_CATEGORY_SET = new Set(
  BLOCKED_EXACT_CATEGORIES.map((name) => name.toLowerCase()),
);

export const SECONDARY_UNLINK_CATEGORY_SET = new Set(
  SECONDARY_UNLINK_CATEGORIES.map((name) => name.toLowerCase()),
);

/** @deprecated Prefer BLOCKED_EXACT_CATEGORIES — kept as alias for older imports. */
export const BLOCKED_PRIMARY_CATEGORIES = BLOCKED_EXACT_CATEGORIES;

/**
 * @param {string|null|undefined} name
 * @returns {boolean}
 */
export function isBlockedExactCategory(name) {
  if (name == null) return false;
  const key = String(name).trim().toLowerCase();
  return key.length > 0 && BLOCKED_EXACT_CATEGORY_SET.has(key);
}

/**
 * @param {string|null|undefined} name
 * @returns {boolean}
 */
export function isSecondaryUnlinkCategory(name) {
  if (name == null) return false;
  const key = String(name).trim().toLowerCase();
  return key.length > 0 && SECONDARY_UNLINK_CATEGORY_SET.has(key);
}

/**
 * Primary is deletable junk (exact blocklist or HVAC substring on the primary name).
 * @param {string|null|undefined} name
 * @returns {boolean}
 */
export function isDeletePrimaryCategory(name) {
  if (name == null) return false;
  if (isBlockedExactCategory(name)) return true;
  return findBlockedCategorySubstring(String(name).toLowerCase()) != null;
}

/** Titles that look like real auto / radiator shops even with a junk primary. */
const KEEP_TITLE_RE =
  /\b(radiators?|auto\s*repairs?|auto\s*services?|auto\s*body|mechanics?|mufflers?|transmissions?|cooling\s*systems?|truck\s*repairs?|diesels?)\b/i;

/**
 * @param {{ title?: string|null, categoryName?: string|null }} biz
 * @returns {boolean} true if this unclaimed business should be deleted
 */
export function shouldDeleteBusinessForPrimaryCategory(biz) {
  const categoryName = biz?.categoryName ?? biz?.primary_category_name ?? null;
  if (!isDeletePrimaryCategory(categoryName)) return false;
  const title = biz?.title != null ? String(biz.title) : "";
  if (title && KEEP_TITLE_RE.test(title)) return false;
  return true;
}

/**
 * @param {string} text lowercase haystack
 * @returns {string|null} matched substring term
 */
export function findBlockedCategorySubstring(text) {
  if (!text?.trim()) return null;
  for (const term of CATEGORY_BLOCKLIST) {
    if (text.includes(term.toLowerCase())) return term;
  }
  return null;
}
