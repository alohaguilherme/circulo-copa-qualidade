import { createClient } from "@libsql/client";

const globalForDb = global as unknown as { dbClient: ReturnType<typeof createClient> };

export const db =
  globalForDb.dbClient ??
  createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") globalForDb.dbClient = db;
