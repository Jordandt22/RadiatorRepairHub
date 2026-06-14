import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FLOW_PATHS } from "../flowPaths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = FLOW_PATHS.filtered;

if (!fs.existsSync(inputPath)) {
  console.error(`start.json not found: ${inputPath}`);
  process.exit(1);
}

const businesses = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const categoryNameCounts = {};

console.log(`Categories for ${businesses.length} businesses in start.json:\n`);

businesses.forEach((business, index) => {
  const { title, placeId, categoryName, categories } = business;
  const categoryList = Array.isArray(categories) ? categories : [];

  if (categoryName) {
    categoryNameCounts[categoryName] = (categoryNameCounts[categoryName] || 0) + 1;
  }

  console.log(`${index + 1}. ${title}`);
  console.log(`   placeId: ${placeId ?? "null"}`);
  console.log(`   categoryName: ${categoryName ?? "null"}`);
  console.log(
    `   categories: ${
      categoryList.length > 0 ? categoryList.join(", ") : "[]"
    }`
  );
  console.log("");
});

const uniqueCategoryNames = Object.keys(categoryNameCounts).sort();

console.log("---");
console.log(`Unique categoryName values (${uniqueCategoryNames.length}):`);
uniqueCategoryNames.forEach((name) => {
  console.log(`  - ${name} (${categoryNameCounts[name]})`);
});
