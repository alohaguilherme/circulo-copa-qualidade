import { createClient } from "@libsql/client";

type DbClient = ReturnType<typeof createClient>;
const globalForDb = global as unknown as { dbClient: DbClient };

function getDb(): DbClient {
  if (globalForDb.dbClient) return globalForDb.dbClient;
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  if (process.env.NODE_ENV !== "production") globalForDb.dbClient = client;
  return client;
}

export const db = new Proxy({} as DbClient, {
  get(_, prop) {
    const client = getDb();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
