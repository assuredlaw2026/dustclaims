# Blog Post Pages — Design

**Date:** 2026-07-22
**Status:** Approved (pending spec review)

## Problem

DustClaims is a hand-authored static site with **no build step** (`netlify.toml` →
`publish = "."`). Blog posts are authored as JSON entries in `_data/posts.json` through
Decap CMS at `/admin`. The blog listing (`blog/index.html` + `loadBlogPosts()` in
`js/site.js`) renders cards that link to `/blog/<slug>.html`.

**Those per-post pages do not exist and nothing generates them.** There is one post in
`posts.json` and no corresponding `blog/*.html` file. On the live site, clicking any blog
post would 404. "Starting a blog" therefore requires building the article-page mechanism,
not just adding content.

## Goals

- Every post in `posts.json` resolves to a real page at `/blog/<slug>.html`.
- Staff continue to author posts entirely in Decap CMS (JSON), never touching code.
- Post pages have real server-rendered content (good SEO) and correct per-post Open Graph
  / Twitter Card metadata (correct social-share previews on FB/IG/X/LinkedIn).
- Post pages reuse the existing site shell (nav, footer, alert bar, styles) with no new
  styling work.

## Non-goals (YAGNI for launch)

- Per-post images (default OG image is used; per-post image field is a future add).
- Pagination, tags/category archive pages, RSS feed.
- Converting the site to a static-site generator.

## Chosen approach: build-time generation (Option C)

Keep the existing Decap JSON authoring flow unchanged. Add a small Node build script that
Netlify runs on each deploy; it reads `posts.json` and writes one real HTML page per post.

Rejected alternatives:
- **A. Client-side rendering** — simplest, zero build, but social scrapers don't run JS,
  so every shared post link shows a generic preview. The firm actively posts to IG/FB/X,
  so this is disqualifying.
- **B. Static-site generator (Eleventy/Hugo)** — best SEO but restructures the entire
  hand-built site and adds a toolchain to maintain. Disproportionate to the need.

## Data flow

```
Staff add/edit/delete post in /admin
  → Decap commits _data/posts.json to main
    → Netlify build runs `node build.js`
      → build.js renders each post → /blog/<slug>.html
        → Netlify publishes "." (generated pages included)
```

Deleting a post in the CMS removes its entry from `posts.json`; because generated pages are
produced fresh each build and are not committed, the stale page simply stops being emitted.

## Components

### `build.js` (generator)
- Reads `_data/posts.json`.
- For each post:
  - Converts the markdown `content` field to HTML at build time using `marked`.
  - Injects `title`, `date`, `category`, `author`, `excerpt`, rendered content, and `slug`
    into the post template.
  - Writes `blog/<slug>.html`.
- Idempotent: safe to run repeatedly; overwrites existing generated files.

### Post template (inline in `build.js`)
- Reuses the existing shell: alert bar, `<nav id="site-nav">` + `renderNav('blog')`,
  `<footer id="site-footer">` + `renderFooter()`, `/css/style.css`, and `/js/site.js`.
- `<head>` per post:
  - `<title>` = post title + site suffix.
  - `<meta name="description">` = excerpt.
  - Open Graph tags: `og:title`, `og:description`, `og:url` (canonical
    `https://www.dustclaims.com/blog/<slug>.html`), `og:type=article`, `og:image`.
  - Twitter Card tags mirroring the above.
  - Canonical `<link rel="canonical">`.
  - JSON-LD `Article` structured data (headline, datePublished, author, publisher).
- Default `og:image` = existing site image (`/img/hero-dozer.jpg`).
- Renders the post body, formatted date, and category in the page body using existing
  site styles.

### Wiring
- **`package.json`** — one dependency (`marked`), `"scripts": { "build": "node build.js" }`.
- **`netlify.toml`** — add `command = "node build.js"` under `[build]`; keep
  `publish = "."`. Existing `/admin` rewrite and `/*` 404 redirect are unchanged.
- **`.gitignore`** — ignore generated `/blog/*.html` **except** `/blog/index.html`
  (hand-authored). Generated pages live only in the deploy output.

## Verification

**Local:**
1. `npm install`
2. `node build.js`
3. Confirm `blog/tro-granted-pulte-lake-moor-july-2026.html` exists.
4. Open it: content renders (headings, lists, bold), nav + footer + styles present, and
   `<head>` contains the correct `<title>`, description, and OG tags.
5. Confirm the listing link `/blog/<slug>.html` from `blog/index.html` resolves to it.

**Netlify preview:**
6. Confirm the post page loads on the preview URL.
7. Confirm a shared-link preview (or a scraper/debugger tool) shows the post-specific
   title, description, and image.

## Assumptions / dependencies (outside this spec)

- Netlify build environment provides Node + npm (it does by default).
- Netlify Identity + Git Gateway must be enabled in the Netlify UI for Decap CMS to work —
  this is part of the separate launch/verification workstream, not this build change.
