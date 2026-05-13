import { addStates } from "./states.js";
import { addCities } from "./cities.js";
import { addPostalCodes } from "./postal.js";
import fs from "fs";

export async function addLocations() {
  const { data: states, error: statesError } = await addStates();
  if (statesError) {
    return console.error("❌ Error inserting states:", statesError);
  } else {
    console.log("✅ States inserted/updated:", states.length);
  }

  fs.writeFileSync("./src/data/states.json", JSON.stringify(states, null, 2));

  const { data: cities, error: citiesError } = await addCities();
  if (citiesError) {
    return console.error("❌ Error inserting cities:", citiesError);
  } else {
    console.log(`✅ Inserted/Updated ${cities.length} cities`);
  }

  fs.writeFileSync("./src/data/cities.json", JSON.stringify(cities, null, 2));

    const { data: postalCodes, error: postalCodesError } = await addPostalCodes();
  if (postalCodesError) {
    return console.error("❌ Error inserting postal codes:", postalCodesError);
  } else {
    console.log(`✅ Inserted/Updated ${postalCodes.length} postal codes`);
  }

  fs.writeFileSync("./src/data/postal_codes.json", JSON.stringify(postalCodes, null, 2));
}
