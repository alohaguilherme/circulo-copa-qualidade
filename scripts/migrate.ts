import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const PROTOCOLS = [
  { id: "meta-01-identificacao", name: "Meta 01: Identificação", category: "meta" },
  { id: "meta-02-comunicacao", name: "Meta 02: Comunicação", category: "meta" },
  { id: "meta-03-medicamentos", name: "Meta 03: Medicamentos", category: "meta" },
  { id: "meta-04-cirurgia-segura", name: "Meta 04: Cirurgia Segura", category: "meta" },
  { id: "meta-05-higiene-maos", name: "Meta 05: Higiene de Mãos", category: "meta" },
  { id: "meta-06-quedas", name: "Meta 06: Quedas", category: "meta" },
  { id: "meta-06-lesao-pressao", name: "Meta 06: Lesão por Pressão", category: "meta" },
  { id: "prot-dor-toracica", name: "Prot. Dor Torácica", category: "protocolo" },
  { id: "prot-avc", name: "Prot. AVC", category: "protocolo" },
  { id: "prot-dor", name: "Prot. Dor", category: "protocolo" },
  { id: "prot-sepse", name: "Prot. Sepse", category: "protocolo" },
  { id: "prot-deterioracao", name: "Prot. Deterioração", category: "protocolo" },
];

async function main() {
  console.log("Creating tables...");

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      email_hash TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sector TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS protocols (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      qr_token TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_stickers (
      user_id TEXT NOT NULL REFERENCES users(id),
      protocol_id TEXT NOT NULL REFERENCES protocols(id),
      scanned_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, protocol_id)
    );
  `);

  console.log("Seeding protocols...");

  for (const p of PROTOCOLS) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO protocols (id, name, category, qr_token) VALUES (?, ?, ?, ?)`,
      args: [p.id, p.name, p.category, randomUUID()],
    });
  }

  const result = await db.execute("SELECT id, name, qr_token FROM protocols ORDER BY id");
  console.log("\nProtocols seeded:");
  for (const row of result.rows) {
    console.log(`  ${row.id}: ${row.qr_token}`);
  }

  console.log("\nMigration complete!");
}

main().catch(console.error);
