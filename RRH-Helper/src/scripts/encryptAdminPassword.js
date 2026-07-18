import bcrypt from "bcrypt";

// Change this to the admin password you want to hash
const password = "REPLACE HERE";

const SALT_ROUNDS = 12;

async function main() {
  if (!password) {
    console.error("Set the `password` variable in this file before running.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
