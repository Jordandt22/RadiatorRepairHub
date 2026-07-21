import { spawn } from "node:child_process";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(rootDir, ".env") });

const target = process.argv[2]?.toLowerCase();
const envKeys =
  target === "prod"
    ? { projectRef: process.env.SUPABASE_PROD_PROJECT_REF, password: process.env.SUPABASE_PROD_PASSWORD }
    : target === "dev"
      ? { projectRef: process.env.SUPABASE_DEV_PROJECT_REF, password: process.env.SUPABASE_DEV_PASSWORD }
      : null;

if (!envKeys || !envKeys.projectRef || !envKeys.password) {
  console.error("Usage: node scripts/supabase-link.mjs <dev|prod>");
  process.exit(1);
}

const child = spawn("supabase", ["link", "--project-ref", envKeys.projectRef, "--password", envKeys.password], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
