import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export async function updateBusinesses() {
  // Load reference JSONs
  const states = JSON.parse(fs.readFileSync("./src/data/states.json", "utf-8"));
  const cities = JSON.parse(fs.readFileSync("./src/data/cities.json", "utf-8"));
  const postalCodes = JSON.parse(
    fs.readFileSync("./src/data/postal_codes.json", "utf-8")
  );
  const primaryCategories = JSON.parse(
    fs.readFileSync("./src/data/primary_categories.json", "utf-8")
  );
  const secondaryCategories = JSON.parse(
    fs.readFileSync("./src/data/secondary_categories.json", "utf-8")
  );
  const businesses = JSON.parse(
    fs.readFileSync("./src/data/formatted.json", "utf-8")
  );

  // Build lookup maps
  const stateMap = Object.fromEntries(
    states.map((s) => [s.name.toLowerCase(), s])
  );
  const stateCodeMap = Object.fromEntries(
    states.map((s) => [s.code.toLowerCase(), s])
  );
  const cityMap = {};
  cities.forEach((c) => {
    cityMap[`${c.name.toLowerCase()}|${c.state_id}`] = c;
  });
  const postalCodeMap = {};
  postalCodes.forEach((p) => {
    postalCodeMap[`${p.city_id}|${p.code.toLowerCase()}`] = p;
  });
  const primaryMap = Object.fromEntries(
    primaryCategories.map((p) => [p.name.toLowerCase(), p])
  );
  const secondaryMap = Object.fromEntries(
    secondaryCategories.map((s) => [s.name.toLowerCase(), s])
  );

  const processed = [];

  for (const biz of businesses) {
    let updatedBiz = { ...biz };
    const stateVal = biz.state?.trim().toLowerCase();
    let state = stateMap[stateVal] || stateCodeMap[stateVal];
    if (!state) {
      console.warn(
        `⚠️ State not found for business: ${biz.title} (${biz.state})`
      );
      continue;
    }

    const cityKey = `${biz.city?.trim().toLowerCase()}|${state.id}`;
    const city = cityMap[cityKey];
    if (!city) {
      console.warn(`⚠️ City not found: ${biz.city} in ${biz.state}`);
    }

    const postalCodeKey = `${city?.id}|${biz.postal_code
      ?.toString()
      .trim()
      .toLowerCase()}`;

    const postalCode = postalCodeMap[postalCodeKey];
    if (!postalCode) {
      console.warn(`⚠️ Postal code not found: ${postalCodeKey}`);
    }

    const primaryCategory = biz.category_name
      ? primaryMap[biz.category_name.trim().toLowerCase()]
      : null;

    if (!primaryCategory) {
      console.warn(`⚠️ Primary category not found: ${biz.category_name}`);
    }

    // Update City, State, and Primary Category
    updatedBiz.state_id = state.id;
    updatedBiz.city_id = city?.id || null;
    updatedBiz.postal_code_id = postalCode?.id || null;
    updatedBiz.primary_category_id = primaryCategory?.id || null;
    updatedBiz.secondary_category_ids = [];

    // Link secondary categories
    if (Array.isArray(biz.categories)) {
      for (const sec of biz.categories) {
        const secCategory = secondaryMap[sec.trim().toLowerCase()];
        if (secCategory) {
          updatedBiz.secondary_category_ids.push(secCategory.id);
        } else {
          console.warn(`⚠️ Secondary category not found: ${sec}`);
        }
      }
    }

    // Remove Fields
    delete updatedBiz.categories;
    delete updatedBiz.category_name;
    delete updatedBiz.state;
    delete updatedBiz.city;
    delete updatedBiz.postal_code;

    processed.push({ ...updatedBiz });
  }

  fs.writeFileSync(
    "./src/data/updated.json",
    JSON.stringify(processed, null, 2)
  );
  console.log(`✅ Processed ${processed.length} businesses`);
}

export default updateBusinesses;
