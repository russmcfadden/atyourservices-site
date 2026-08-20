/**
 * _click.js - shared click-recording helpers for /book and /demo.
 *
 * The leading underscore matters: Pages never routes a function whose filename starts with "_", so this
 * is a module, not an endpoint.
 *
 * WHY THIS EXISTS: the first real read of the CLICKS namespace (2026-08-19, 17 records) was 9/17
 * automated - MJ12bot four times, curl four times, plus a scanner using a stale iPhone 13.2.3 UA from
 * two countries nine minutes apart. Every one of those had an EMPTY REFERER, which is exactly the
 * signature the design treats as "a QR scan from the leaflet or a tap in the PDF". Without a bot marker
 * the offline-attribution signal is unreadable: crawler and leaflet look identical.
 *
 * Tag, do not drop. A skipped write loses the evidence that a crawler found the URL at all, and the
 * reason string lets a misclassification be spotted and revisited later.
 */

// Deliberately broad. A false positive costs one mislabelled row that is still stored and still
// inspectable; a false negative silently pollutes the only offline-attribution signal there is.
const BOT_UA = /bot\b|bots?[\/_-]|crawl|spider|slurp|curl|wget|python-requests|go-http|java\/|libwww|headless|phantom|scrapy|monitor|uptime|preview|facebookexternalhit|mj12|ahrefs|semrush|dotbot|petalbot|bingpreview|yandex|baidu/i;

/**
 * Classify a request as automated. Returns "" for a plausible human, else a short REASON string
 * (stored as-is) so a wrong call can be diagnosed without guessing which rule fired.
 */
export function classifyBot(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!ua) return "no-ua";                       // no browser omits this; scripts routinely do
  // Cloudflare's own verified-bot signal, when the plan exposes it - authoritative, so check it first.
  const verified = request.cf?.verifiedBotCategory;
  if (verified) return `verified:${verified}`;
  if (BOT_UA.test(ua)) return "ua-match";
  return "";
}

/**
 * Build the stored record. `bot` is present ONLY when the request looks automated, so human rows keep
 * the exact shape written before 2026-08-19 and old records stay comparable to new ones.
 * Deliberately NOT stored: IP address. Counting clicks does not require identifying people.
 */
export function clickValue(request, now) {
  const bot = classifyBot(request);
  return JSON.stringify({
    t: now,
    ref: request.headers.get("referer") || "",     // "" for QR scans and PDF taps - AND for most bots
    ua: (request.headers.get("user-agent") || "").slice(0, 200),
    country: request.cf?.country || "",
    ...(bot ? { bot } : {}),
  });
}
