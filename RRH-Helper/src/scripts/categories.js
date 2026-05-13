import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function addCategories() {
  const rawData = fs.readFileSync("./src/data/formatted.json", "utf-8");
  const businesses = JSON.parse(rawData);

  const primarySet = new Set();
  const secondarySet = new Set();

  for (const biz of businesses) {
    // Primary
    if (biz.category_name) {
      primarySet.add(biz.category_name.trim());
    }

    // Secondary (array of text)
    if (Array.isArray(biz.categories)) {
      biz.categories.forEach((c) => {
        secondarySet.add(c.trim());
      });
    }
  }

  const primaryCategories = Array.from(primarySet).map((name) => ({ name }));
  const secondaryCategories = Array.from(secondarySet).map((name) => ({
    name,
  }));

  console.log(`Found ${primaryCategories.length} unique primary categories`);
  console.log(
    `Found ${secondaryCategories.length} unique secondary categories`
  );

  // Insert primary categories
  const { data: primaryData, error: primaryError } = await supabase
    .from("primary_categories")
    .upsert(primaryCategories, { onConflict: ["name"] })
    .select("*");

  if (primaryError) {
    return console.error(
      "❌ Error inserting primary categories:",
      primaryError
    );
  } else {
    console.log(
      `✅ Inserted/updated ${primaryCategories.length} primary categories`
    );
  }

  fs.writeFileSync(
    "./src/data/primary_categories.json",
    JSON.stringify(primaryData, null, 2)
  );

  // Insert secondary categories
  const { data: secondaryData, error: secondaryError } = await supabase
    .from("secondary_categories")
    .upsert(secondaryCategories, { onConflict: ["name"] })
    .select("*");

  if (secondaryError) {
    return console.error(
      "❌ Error inserting secondary categories:",
      secondaryError
    );
  } else {
    console.log(
      `✅ Inserted/updated ${secondaryCategories.length} secondary categories`
    );
  }

  fs.writeFileSync(
    "./src/data/secondary_categories.json",
    JSON.stringify(secondaryData, null, 2)
  );
}
