import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.execute(`
    ALTER TABLE users ADD COLUMN album_validated_at TEXT
  `).catch((e: Error) => {
    if (e.message.includes("duplicate column")) {
      console.log("Coluna já existe, pulando.");
    } else {
      throw e;
    }
  });

  console.log("✓ Coluna album_validated_at adicionada à tabela users");
}

main().catch(console.error);
