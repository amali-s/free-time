import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The space-photos bucket must be created manually in the Supabase Dashboard
// (Storage → New bucket, name: space-photos, toggle Public on, no RLS policies
// needed for reads). The service role key bypasses RLS for writes.
const BUCKET = "space-photos";

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — required for Storage writes"
    );
  }
  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

export async function uploadSpacePhoto(
  spaceId: string,
  googlePhotoUrl: string
): Promise<string> {
  // The URL returned by fetchPlacePhotoUrl includes skipHttpRedirect=true,
  // which makes Google return JSON ({photoUri}) instead of image bytes.
  // Stripping the flag causes Google to issue a 302 to the real CDN image,
  // which fetch() follows automatically.
  const url = new URL(googlePhotoUrl);
  url.searchParams.delete("skipHttpRedirect");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `Failed to fetch image from Google (${res.status} ${res.statusText})`
    );
  }
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const bytes = await res.arrayBuffer();

  const path = `${spaceId}.jpg`;
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
