import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

function createDb() {
  if (!connectionString) {
    return null;
  }

  const isSupabaseHost =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com");

  const client = postgres(connectionString, {
    prepare: false,
    // Serverless: 1 conexión por instancia; en Vercel conviene pooler :6543 en Supabase.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 20,
    ...(isSupabaseHost ? { ssl: "require" as const } : {}),
  });

  return drizzle(client, { schema });
}

export const db = createDb();

export type Database = NonNullable<typeof db>;
