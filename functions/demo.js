/**
 * /demo - short link to the live demo instance, with server-side click counting.
 *
 * Same rationale as functions/book.js (read that one for the why). This path additionally backs the QR
 * code printed on the one-page leaflet, which is the only way an in-person handoff can ever show up in
 * analytics at all: no browser page, no JavaScript, nothing for a beacon to fire from.
 *
 * A Pages Function takes precedence over _redirects for the same path, so this file owns /demo.
 */

import { clickValue } from "./_click.js";

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

  // An empty referer is the leaflet-QR / PDF-tap signal the go-to-market plan cannot otherwise see -
  // but crawlers send an empty referer too, so the record carries a bot tag to keep the two apart.
  // Automated requests are TAGGED, never dropped. See _click.js.
  await env.CLICKS.put(key, clickValue(request, now), { expirationTtl: 60 * 60 * 24 * RETAIN_DAYS });
}
