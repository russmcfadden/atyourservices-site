# atyourservices-site

Static portfolio/landing site for **atyourservices.org**. No build step — plain HTML/CSS.

```
index.html                 Landing page (intro, Products, About, Contact)
styles.css                 Single stylesheet
products/scheduling.html   Product description for the Volunteer Scheduling Application
robots.txt                 Crawl directives + sitemap pointer
sitemap.xml                URL list for search engines
favicon.svg / .ico         Calendar-heart brand mark (ice blue / white)
apple-touch-icon.png       180×180 home-screen icon
og-image.png               1200×630 social/link-preview card
```

Each page carries a `<link rel="canonical">`, Open Graph / Twitter Card tags, and JSON-LD
structured data (`Organization` on the landing page, `SoftwareApplication` on the product page).

## Deploy (Cloudflare Pages)
1. Push this folder to its own GitHub repo (e.g. `atyourservices-site`).
2. Create a Cloudflare Pages project pointing at the repo.
   - Framework preset: **None**
   - Build command: *(none)*
   - Build output directory: `/` (repo root)
3. Add custom domains `atyourservices.org` and `www.atyourservices.org`.

The live demo links point to `https://schedule.atyourservices.org` (the scheduling app, hosted separately).

## Get found by search engines (do once, after deploy)

On-page SEO (sitemap, robots, canonical, Open Graph, structured data, favicons) ships in this
repo and in the scheduling app. The remaining steps are external console actions — they're what
actually tells Google/Bing the sites exist and requests indexing:

1. **Google Search Console** (search.google.com/search-console) — add a **Domain property** for
   `atyourservices.org`. Verify with the **DNS TXT** record it gives you, added in **Cloudflare
   DNS**. A domain property covers the apex, `www`, *and* the `schedule.` subdomain in one shot.
   - **Sitemaps →** submit `https://atyourservices.org/sitemap.xml` and
     `https://schedule.atyourservices.org/sitemap.xml`.
   - **URL Inspection →** paste each marketing URL → **Request indexing** to jump the queue.
2. **Bing Webmaster Tools** (bing.com/webmasters) — add the site (you can **import from Google
   Search Console**) and submit the same two sitemaps.
3. **After deploy, sanity-check:** `curl -I https://atyourservices.org/robots.txt` and
   `…/sitemap.xml` return `200`; re-check GSC **Coverage/Pages** after a few days for indexing.

> Note: the scheduling app (`schedule.atyourservices.org`) sets a cross-domain `rel=canonical`
> pointing at `products/scheduling.html`, so its search authority consolidates here rather than
> competing with this site.

## Local preview
Open `index.html` in a browser, or run any static server, e.g.:

```
python3 -m http.server 8080
```
