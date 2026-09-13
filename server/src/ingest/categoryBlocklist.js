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
 * - delete unclaimed businesses when primary matches (title safeguard applies)
 * - unlink when used as a secondary category
 *
 * Intentionally excludes labels that often belong on real radiator /
 * parts companies as primary — those stay in SECONDARY_UNLINK_EXTRA only:
 * Manufacturer, Corporate office, Distribution service, Warehouse, Wholesaler.
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
  "Chauffeur service",
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

  // Insurance / finance / professional
  "Auto insurance agency",
  "Automation company",
  "Business to business service",
  "Car finance and loan company",
  "Consultant",
  "Electrical engineer",
  "Engineer",
  "Engineering consultant",
  "Fabrication engineer",
  "Financial institution",
  "Home insurance agency",
  "Insurance agency",
  "Insurance company",
  "Mechanical engineer",
  "Professional services",
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
  "Heating equipment supplier",
  "HVAC contractor",
  "Mechanical contractor",
  "Mechanical plant",

  // Ag / farm chemicals (not equipment cooling)
  "Agrochemicals supplier",
  "Agricultural service",
  "Agricultural machinery manufacturer",

  // Sales / logistics / storage (not repair)
  "Auto auction",
  "Auto broker",
  "Auto tag agency",
  "Automobile storage facility",
  "Car factory",
  "Car leasing service",
  "Car manufacturer",
  "Car rental agency",
  "Cars",
  "Forklift rental service",
  "Leasing service",
  "Motorcycle rental agency",
  "Recreational vehicle rental agency",
  "Showroom",
  "Tesla showroom",
  "Trailer rental service",
  "Truck rental agency",
  "Truck stop",
  "Trucking company",
  "Van rental agency",

  // Lifestyle / detailing / wrapping
  "Boat detailing service",
  "Pressure washing service",
  "RV detailing service",
  "Self service car wash",
  "Vehicle wrapping service",
  "Vinyl sign shop",

  // RV lifestyle (not repair shops)
  "RV park",
  "RV storage facility",

  // Marine / powersports lifestyle (not cooling repair)
  "Lawn mower store",
  "Marine supply store",
  "Mobile home supply store",
  "Outboard motor store",
  "Personal watercraft dealer",
  "Propeller shop",
  "Water ski shop",
  "Water sports equipment rental service",

  // Outdoor retail
  "Camping store",
  "Outdoor clothing and equipment shop",
  "Outdoor sports store",

  // Home/commercial electrical (not auto electrical)
  "Electrical installation service",
  "Electrical supply store",
  "Electrician",

  // Non-auto glass
  "Glass cutting service",
  "Glass industry",

  // Transport / shipping
  "Refrigerated transport service",
  "Transportation service",
  "Vehicle shipping agent",

  // Schools / misc services
  "Motorcycle driving school",
  "Electric vehicle charging station",
  "Junk removal service",

  // Industrial / misc suppliers unrelated to auto cooling
  "Audio visual equipment supplier",
  "Barrel supplier",
  "Construction equipment supplier",
  "Crane service",
  "Diesel fuel supplier",
  "Do-it-yourself shop",
  "Dry ice supplier",
  "E-commerce service",
  "Fire department equipment supplier",
  "Hardware store",
  "Industrial equipment supplier",
  "Industrial gas supplier",
  "Irrigation equipment supplier",
  "Kerosene supplier",
  "Metallurgy company",
  "Metalware dealer",
  "Mining equipment",
  "Oil field equipment supplier",
  "Plastic fabrication company",
  "Power plant equipment supplier",
  "Propane supplier",
  "Rubber products supplier",
  "Safety equipment supplier",
  "Store",
  "Tool rental service",
  "Tool store",
  "Tune up supplier",

  // Unrelated retail / services
  "ATM",
  "Bicycle Shop",
  "Boot repair shop",
  "Clothing store",
  "Computer repair service",
  "Computer service",
  "Consignment shop",
  "Convenience store",
  "Delivery service",
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
 * Unlink as secondaries only — do NOT auto-delete businesses with these as primary.
 * Often real radiator / parts companies. Review with the operator before deleting.
 */
export const SECONDARY_UNLINK_EXTRA_CATEGORIES = [
  "Corporate office",
  "Distribution service",
  "Manufacturer",
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
  /\b(radiators?|auto\s*repairs?|auto\s*services?|auto\s*shops?|auto\s*care|auto\s*body|automotives?|mechanics?|mufflers?|transmissions?|cooling(?:\s*systems?)?|truck\s*repairs?|truck\s*centers?|diesels?|mobile\s+repairs?|ford|chevrolet|chevy|toyota|honda|nissan|gmc)\b/i;

/** Home / building radiators — do not keep just because title says "radiator". */
const HOME_RADIATOR_TITLE_RE =
  /\b(cast\s*iron|enclosures?|hydronic|boiler|furnace|soho)\b/i;

/**
 * @param {{ title?: string|null, categoryName?: string|null }} biz
 * @returns {boolean} true if this unclaimed business should be deleted
 */
export function shouldDeleteBusinessForPrimaryCategory(biz) {
  const categoryName = biz?.categoryName ?? biz?.primary_category_name ?? null;
  if (!isDeletePrimaryCategory(categoryName)) return false;
  const title = biz?.title != null ? String(biz.title) : "";
  if (title && HOME_RADIATOR_TITLE_RE.test(title)) return true;
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
