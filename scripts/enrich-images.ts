import {
  fetchPlacePhotoUrl,
  PlacesRateLimitError,
} from "../src/lib/geo/google-places";
import { uploadSpacePhoto } from "../src/lib/storage/upload-space-photo";
import {
  getSpacesWithoutImages,
  updateSpaceImage,
} from "../src/lib/db/queries";

const BATCH_SIZE = 50;
const MAX_RETRIES = 4;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  let offset = 0;

  for (;;) {
    const rows = await getSpacesWithoutImages(BATCH_SIZE, offset);
    if (rows.length === 0) break;

    const total = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const space = rows[i];
      const label = `${i + 1}/${total}`;

      let attempt = 0;

      while (attempt <= MAX_RETRIES) {
        try {
          const googleUrl = await fetchPlacePhotoUrl(space.name, space.address);

          if (googleUrl === null) {
            await updateSpaceImage(space.id, null);
            console.log(`${label} — ${space.name} → no match`);
          } else {
            const supabaseUrl = await uploadSpacePhoto(space.id, googleUrl);
            await updateSpaceImage(space.id, supabaseUrl);
            console.log(`${label} — ${space.name} → ok`);
          }
          break;
        } catch (err) {
          if (err instanceof PlacesRateLimitError) {
            const wait = Math.min(2 ** attempt, 32);
            console.log(
              `rate limited — waiting ${wait}s (attempt ${attempt + 1}/${MAX_RETRIES})`
            );
            await sleep(wait * 1000);
            attempt++;
            if (attempt > MAX_RETRIES) {
              console.error(
                `${label} — ${space.id} → rate-limit retries exhausted, leaving for next run`
              );
              break;
            }
            continue;
          }

          const message = err instanceof Error ? err.message : String(err);
          console.error(`${label} — ${space.id} → ERROR: ${message}`);
          break;
        }
      }

      await sleep(100);
    }

    offset += BATCH_SIZE;
  }

  console.log("done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
