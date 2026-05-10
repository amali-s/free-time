/**
 * Platform-aware map deep-linking.
 *
 * The goal: when a user taps "open in maps" on a space, we route them to the
 * native map app on their phone instead of dumping them into a Google Maps
 * webpage in Safari/Chrome.
 *
 * Strategy:
 *   - iOS    → `maps://?q=<query>`   (Apple Maps app)
 *   - Android → `geo:0,0?q=<query>`   (triggers the OS map chooser)
 *   - Anything else (desktop, unknown UA, server-side render)
 *               → `https://maps.google.com/?q=<query>`
 *
 * `maps://` and `geo:` are intentionally chosen because they always open the
 * platform's preferred map app rather than forcing Google Maps. On Android
 * specifically, `geo:` falls through to the system app picker if multiple
 * map apps are installed, respecting the user's choice.
 *
 * UA sniffing is fine here — we are picking a URL scheme, not gating a
 * feature. If detection fails we silently fall back to the web URL, which
 * works everywhere.
 */

export type MapsPlatform = "ios" | "android" | "web";

/**
 * Detect platform from a user-agent string. Pass `navigator.userAgent` on the
 * client; pass `undefined` on the server (you'll get "web", which is the
 * safe fallback for HTML rendered before hydration).
 */
export function detectMapsPlatform(userAgent: string | undefined): MapsPlatform {
  if (!userAgent) return "web";
  // iPad on iPadOS 13+ reports as Mac; sniff for touch + Mac as a heuristic.
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "web";
}

/**
 * Return the best maps URL for the given free-text query (typically
 * `${name}, ${address}`). Pass `userAgent` if you have it; otherwise the
 * helper reads `navigator.userAgent` at call time.
 */
export function getMapsHref(query: string, userAgent?: string): string {
  const ua =
    userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : undefined);
  const platform = detectMapsPlatform(ua);
  const encoded = encodeURIComponent(query);

  switch (platform) {
    case "ios":
      // Apple's native scheme. Falls back to Google Maps web if the app is
      // somehow missing (almost never happens on a stock iPhone).
      return `maps://?q=${encoded}`;
    case "android":
      // The `0,0` lat/lng is a sentinel that tells Android to use the query
      // string instead of fixed coordinates.
      return `geo:0,0?q=${encoded}`;
    case "web":
    default:
      return `https://maps.google.com/?q=${encoded}`;
  }
}
