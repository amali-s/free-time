import { db } from "../src/lib/db/client";
import { spaces } from "../src/lib/db/schema";
import { isNull, sql } from "drizzle-orm";

async function main() {
  const total = await db.select({ c: sql<number>`count(*)` }).from(spaces);
  const todo  = await db.select({ c: sql<number>`count(*)` }).from(spaces).where(isNull(spaces.imageEnrichedAt));
  console.log(`total_spaces=${total[0]?.c ?? 0}`);
  console.log(`unenriched=${todo[0]?.c ?? 0}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
