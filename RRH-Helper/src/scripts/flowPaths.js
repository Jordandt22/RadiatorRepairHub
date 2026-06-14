import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SRC_ROOT = path.join(__dirname, "..");
export const FLOW_DIR = path.join(SRC_ROOT, "flow");

export const FLOW_PATHS = {
  newJson: path.join(FLOW_DIR, "raw", "new.json"),
  filtered: path.join(FLOW_DIR, "filter", "start.json"),
  enriched: path.join(FLOW_DIR, "enrich", "enriched.json"),
  final: path.join(FLOW_DIR, "final", "final.json"),
  newCities: path.join(FLOW_DIR, "final", "new_cities.json"),
  newPrimaryCategories: path.join(
    FLOW_DIR,
    "final",
    "new_primary_categories.json"
  ),
  newSecondaryCategories: path.join(
    FLOW_DIR,
    "final",
    "new_secondary_categories.json"
  ),
  newPostalCodes: path.join(FLOW_DIR, "final", "new_postal_codes.json"),
};

export function ensureFlowDirs() {
  for (const dir of ["raw", "filter", "enrich", "final"]) {
    fs.mkdirSync(path.join(FLOW_DIR, dir), { recursive: true });
  }
}
