import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Parser } from "json2csv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, "../../raw/start.json");
const outputPath = path.join(__dirname, "../../raw/start.csv");

function serializeForCsv(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const fields = Object.keys(data[0]);

const rows = data.map((item) =>
  Object.fromEntries(
    fields.map((field) => [field, serializeForCsv(item[field])])
  )
);

const csv = new Parser({ fields }).parse(rows);

fs.writeFileSync(outputPath, csv);

console.log(`Converted ${rows.length} records → ${outputPath}`);
