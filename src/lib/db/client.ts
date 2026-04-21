import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local with your Supabase PostgreSQL connection string."
  );
}

// Create the postgres.js client
// max: 1 for serverless environments (Next.js API routes / server components)
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
});

// Create the Drizzle client with schema for relational queries
export const db = drizzle(client, { schema });
