/**
 * /book - short link to the Google appointment scheduler, with server-side click counting.
 *
 * WHY A FUNCTION AND NOT JUST _redirects:
 * Cloudflare Web Analytics is a RUM beacon - page views and timing only, no custom events - so an
 * outbound click is invisible to it. "Arrived but did not book" and "never arrived" are different
 * failures with different fixes, and we could not tell them apart.
 *
 * WHY NOT CLIENT-SIDE (Zaraz / a JS click listener):
 * The two clicks that matter most have no page to run JavaScript on - a QR scan from the printed
 * leaflet, and a link tapped inside the emailed PDF. Counting at the redirect catches those, plus
 * anyone with JS disabled or an ad blocker, and it collects nothing that needs a consent banner.
 *
 * NOTE: a Pages Function takes precedence over _redirects for the same path, and _redirects rules are
 * NOT applied to a request a Function serves - so this file, not _redirects, owns /book.
 */

import { clickValue } from "./_click.js";

const DESTINATION =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2L5uKGFp8XqsR9OMb61MjV-o6UUIZKyOxZQ1cUEgiDg9uUVnceh87JnAWfFDZvr2fnPjddIzyH?gv=true";

const RETAIN_DAYS = 180;

export async function onRequest(context) {
  const { request, env } = context;

  // Recording must never be able to break the redirect: a booking link that 500s because a KV binding
  // is missing would cost far more than the measurement is worth.
  context.waitUntil(record(env, request).catch(() => {}));

  return Response.redirect(DESTINATION, 302);
}

async function record(env, request) {
  if (!env.CLICKS) return; // binding not configured yet - degrade to a plain redirect

  const now = new Date().toISOString();
  // One key per click rather than an incrementing counter: no read-modify-write race, and at this
  // volume the individual timestamps are the point - they are what lets an outreach email or a
  // leaflet handed over on a given day be matched to the click it produced.
  const key = `book:${now}:${crypto.randomUUID().slice(0, 8)}`;

  // Automated requests are TAGGED (bot: "<reason>"), never dropped - see _click.js for why an empty
  // referer alone can no longer be read as an offline scan.
  await env.CLICKS.put(key, clickValue(request, now), { expirationTtl: 60 * 60 * 24 * RETAIN_DAYS });
}
