import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy Drizzle client.
 *
 * We defer reading DATABASE_URL until the first request rather than at module
 * load. This matters on Vercel: route module imports can be evaluated during
 * the build phase before runtime env vars are bound, and we don't want a
 * missing var to abort the build (it should fail at request time with a clear
 * 500 instead).
 */

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleClient | null = null;

function getDb(): DrizzleClient {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local locally, or set it in your Vercel project's Environment Variables."
    );
  }

  // max: 1 for serverless environments (Next.js Route Handlers).
  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
  });

  cached = drizzle(client, { schema });
  return cached;
}

/**
 * Proxy that lazily resolves the underlying Drizzle client on each access.
 * Existing call-sites (`db.select(...)`, `db.execute(sql\`...\`)`, etc.) keep
 * working unchanged.
 */
export const db = new Proxy({} as DrizzleClient, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop as string];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : Reflect.get(real, prop, receiver);
  },
});
