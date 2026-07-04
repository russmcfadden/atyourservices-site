# atyourservices-site

Static portfolio/landing site for **atyourservices.org**. No build step — plain HTML/CSS.

```
index.html                 Landing page (intro, Products, About, Contact)
styles.css                 Single stylesheet
products/scheduling.html   Product description for the Volunteer Scheduling Application
```

## Deploy (Cloudflare Pages)
1. Push this folder to its own GitHub repo (e.g. `atyourservices-site`).
2. Create a Cloudflare Pages project pointing at the repo.
   - Framework preset: **None**
   - Build command: *(none)*
   - Build output directory: `/` (repo root)
3. Add custom domains `atyourservices.org` and `www.atyourservices.org`.

The live demo links point to `https://schedule.atyourservices.org` (the scheduling app, hosted separately).

## Local preview
Open `index.html` in a browser, or run any static server, e.g.:

```
python3 -m http.server 8080
```
