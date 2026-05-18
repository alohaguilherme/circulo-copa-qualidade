import { hash } from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Uso: bun run scripts/hash-password.ts <senha>");
  process.exit(1);
}

const hashed = await hash(password, 12);
const encoded = Buffer.from(hashed).toString("base64");
console.log("\nCole no ADMIN_PASSWORD_HASH do .env:\n");
console.log(encoded);
console.log();
