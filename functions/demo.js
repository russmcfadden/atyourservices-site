/**
 * /demo - short link to the live demo instance, with server-side click counting.
 *
 * Same rationale as functions/book.js (read that one for the why). This path additionally backs the QR
 * code printed on the one-page leaflet, which is the only way an in-person handoff can ever show up in
 * analytics at all: no browser page, no JavaScript, nothing for a beacon to fire from.
 *
 * A Pages Function takes precedence over _redirects for the same path, so this file owns /demo.
 */

const DESTINATION = "https://schedule.atyourservices.org";

const RETAIN_DAYS = 180;

export async function onRequest(context) {
  const { request, env } = context;

  // Never let recording break the redirect - see book.js.
  context.waitUntil(record(env, request).catch(() => {}));

  return Response.redirect(DESTINATION, 302);
}

async function record(env, request) {
  if (!env.CLICKS) return; // binding not configured yet - degrade to a plain redirect

  const now = new Date().toISOString();
  const key = `demo:${now}:${crypto.randomUUID().slice(0, 8)}`;

  const value = JSON.stringify({
    t: now,
    // An empty referer here most likely means the leaflet QR code or a link from the PDF - i.e. an
    // offline asset produced a visit. That is the number the go-to-market plan cannot otherwise see.
    ref: request.headers.get("referer") || "",
    ua: (request.headers.get("user-agent") || "").slice(0, 200),
    country: request.cf?.country || "",
    // Deliberately NOT stored: IP address.
  });

  await env.CLICKS.put(key, value, { expirationTtl: 60 * 60 * 24 * RETAIN_DAYS });
}
