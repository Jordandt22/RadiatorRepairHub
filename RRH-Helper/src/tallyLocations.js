import fs from "fs";

function main() {
  const businesses = JSON.parse(
    fs.readFileSync("./src/data/final.json", "utf-8")
  );

  const cities = {};
  const states = {};

  businesses.forEach((business) => {
    cities[business.city_id] = (cities[business.city_id] || 0) + 1;
    states[business.state_id] = (states[business.state_id] || 0) + 1;
  });

  console.log("Cities:", cities);
  console.log("States:", states);
}

main();
