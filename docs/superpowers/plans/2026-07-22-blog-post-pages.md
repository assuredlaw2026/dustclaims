# Blog Post Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a real, SEO-friendly HTML page for every blog post authored in `_data/posts.json`, so the blog listing's `/blog/<slug>.html` links resolve instead of 404ing.

**Architecture:** A small Node build script (`build.js`) reads `_data/posts.json`, renders each post's markdown to HTML, wraps it in the existing site shell with per-post SEO/Open Graph metadata, and writes `blog/<slug>.html`. Netlify runs this script as its build command on every deploy (Decap CMS commits trigger deploys), so staff keep authoring posts as JSON in `/admin` and never touch code. Generated pages are produced fresh each build and are git-ignored.

**Tech Stack:** Node.js (ESM), `marked` (markdown→HTML), Netlify build, Decap CMS (unchanged).

## Global Constraints

- Site has **no framework** — plain static HTML/CSS/JS published from repo root (`netlify.toml` → `publish = "."`).
- Canonical site URL: `https://www.dustclaims.com` (the `www` host is primary).
- Default social-share image: `/img/hero-dozer.jpg`.
- Post pages MUST reuse the existing shell verbatim: alert bar, `<nav id="site-nav">` + `renderNav('blog')`, `<footer id="site-footer">` + `renderFooter()`, `/css/style.css`, `/js/site.js`.
- Author default: `"Assured Law"`.
- Staff-authored markdown from the CMS is trusted (rendered as HTML); only title/excerpt/category values interpolated into HTML attributes or text are escaped.
- Node ESM (`"type": "module"`); `marked` v12+ requires Node ≥ 18.

---

### Task 1: Generator, template, and post styles

**Files:**
- Create: `package.json`
- Create: `build.js`
- Create: `build.test.js`
- Modify: `css/style.css` (append blog-post styles at end of file)

**Interfaces:**
- Produces:
  - `renderPost(post) -> string` — pure function; takes a post object `{title, slug, date, category, author, excerpt, content}` and returns a complete HTML document string.
  - `generate() -> number` — reads `_data/posts.json`, writes `blog/<slug>.html` for each post, returns the count written.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dustclaims",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node build.js",
    "test": "node --test"
  },
  "dependencies": {
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 2: Install the dependency**

Run: `npm install`
Expected: creates `node_modules/` and `package-lock.json`; `marked` installed with no errors.

- [ ] **Step 3: Write the failing test**

Create `build.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPost } from './build.js';

const post = {
  title: 'Test "Quote" Post',
  slug: 'test-post',
  date: '2026-07-15T12:00:00.000Z',
  category: 'Case Update',
  author: 'Assured Law',
  excerpt: 'A short excerpt.',
  content: '## Heading\n\nSome **bold** text.\n\n1. one\n2. two'
};

test('renders markdown content to HTML', () => {
  const html = renderPost(post);
  assert.match(html, /<h2[^>]*>Heading<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<ol>/);
});

test('sets canonical and og:url from slug', () => {
  const html = renderPost(post);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.dustclaims\.com\/blog\/test-post\.html">/);
  assert.match(html, /property="og:url" content="https:\/\/www\.dustclaims\.com\/blog\/test-post\.html"/);
});

test('escapes special characters in title so attributes are not broken', () => {
  const html = renderPost(post);
  assert.match(html, /&quot;Quote&quot;/);
  assert.match(html, /<title>Test &quot;Quote&quot; Post \| Dust Claims<\/title>/);
});

test('uses the default OG image', () => {
  const html = renderPost(post);
  assert.match(html, /property="og:image" content="https:\/\/www\.dustclaims\.com\/img\/hero-dozer\.jpg"/);
});

test('includes Article JSON-LD with the post date', () => {
  const html = renderPost(post);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"datePublished":"2026-07-15T12:00:00.000Z"/);
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `node --test`
Expected: FAIL — `Cannot find module './build.js'` (or `renderPost is not a function`).

- [ ] **Step 5: Write `build.js`**

Create `build.js`:

```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { marked } from 'marked';

const SITE_URL = 'https://www.dustclaims.com';
const DEFAULT_OG_IMAGE = '/img/hero-dozer.jpg';

// Escape text destined for HTML text nodes or double-quoted attributes.
function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderPost(post) {
  const url = `${SITE_URL}/blog/${post.slug}.html`;
  const image = `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const author = post.author || 'Assured Law';
  const dateObj = new Date(post.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const contentHtml = marked.parse(post.content || '');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    author: { '@type': 'Organization', name: author },
    publisher: { '@type': 'Organization', name: 'Assured Law' },
    mainEntityOfPage: url
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(post.title)} | Dust Claims</title>
<meta name="description" content="${esc(post.excerpt)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.excerpt)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(post.excerpt)}">
<meta name="twitter:image" content="${image}">
<script type="application/ld+json">${jsonLd}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="alert-bar">Temporary Restraining Order Issued Against Pulte Homes 3 Kids Mine Project <a href="/cases/pulte-lake-moor.html">Click Here For Updates</a></div>
<nav class="site-nav" id="site-nav"></nav>
<nav class="nav-mobile" id="mobile-nav"><a href="/">Home</a><a href="/private-enforcement/">Private Enforcement</a><a href="/blog/">Blog</a><a href="/about/">About</a><a href="/contact/" class="cta">Report a Claim</a></nav>
<article class="s"><div class="section-inner blog-post">
<div class="blog-date">${dateStr} &nbsp;&middot;&nbsp; ${esc(post.category)}</div>
<h1 class="post-title">${esc(post.title)}</h1>
<div class="blog-post-body">${contentHtml}</div>
<p class="blog-post-back"><a href="/blog/">&larr; Back to all posts</a></p>
</div></article>
<footer class="site-footer" id="site-footer"></footer>
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script src="/js/site.js"></script>
<script>renderNav('blog'); renderFooter();</script>
</body></html>`;
}

export function generate() {
  const data = JSON.parse(readFileSync('_data/posts.json', 'utf8'));
  const posts = data.posts || [];
  mkdirSync('blog', { recursive: true });
  for (const post of posts) {
    writeFileSync(`blog/${post.slug}.html`, renderPost(post));
  }
  return posts.length;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const n = generate();
  console.log(`Generated ${n} blog post page(s).`);
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test`
Expected: PASS — all 5 tests pass.

- [ ] **Step 7: Append blog-post styles to `css/style.css`**

Append at the end of `css/style.css`:

```css

/* ─── BLOG POST ─── */
.blog-post{max-width:760px;margin:0 auto;}
.blog-post .post-title{font-family:var(--font-display);font-size:clamp(1.9rem,4vw,3rem);line-height:1.05;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink);margin:0.4rem 0 1.6rem;}
.blog-post-body{font-size:1.02rem;line-height:1.8;color:var(--ink);}
.blog-post-body h2{font-family:var(--font-display);font-size:1.5rem;letter-spacing:0.03em;text-transform:uppercase;color:var(--ink);margin:2.2rem 0 0.9rem;}
.blog-post-body h3{font-size:1.15rem;font-weight:700;color:var(--ink);margin:1.8rem 0 0.7rem;}
.blog-post-body p{margin:0 0 1.1rem;color:var(--muted);}
.blog-post-body ul,.blog-post-body ol{margin:0 0 1.2rem 1.3rem;color:var(--muted);}
.blog-post-body li{margin-bottom:0.5rem;line-height:1.7;}
.blog-post-body strong{color:var(--ink);font-weight:600;}
.blog-post-body a{color:var(--orange);}
.blog-post-back{margin-top:2.5rem;}
.blog-post-back a{color:var(--muted);text-decoration:none;font-size:0.85rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;}
.blog-post-back a:hover{color:var(--orange);}
```

- [ ] **Step 8: Generate the real post page and inspect it**

Run: `node build.js`
Expected: prints `Generated 1 blog post page(s).` and creates `blog/tro-granted-pulte-lake-moor-july-2026.html`.

Open `blog/tro-granted-pulte-lake-moor-july-2026.html` in a browser and confirm: the post title, date/category, headings, ordered list, and bold text all render with site styling; nav and footer appear (served by `site.js`); no console errors. Confirm the `<head>` contains the post-specific `<title>`, description, and `og:*` tags (view source).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json build.js build.test.js css/style.css
git commit -m "Add build-time blog post page generator"
```

Note: do NOT commit the generated `blog/tro-granted-pulte-lake-moor-july-2026.html` or `node_modules/` — Task 2 adds the `.gitignore` that excludes them. If they appear in `git status` now, leave them unstaged.

---

### Task 2: Netlify build wiring and gitignore

**Files:**
- Create: `.gitignore`
- Modify: `netlify.toml` (add build command)

**Interfaces:**
- Consumes: `build.js` and its `npm run build` script from Task 1.
- Produces: Netlify runs `node build.js` on deploy; generated `blog/*.html` (except `index.html`) and `node_modules/` are git-ignored.

- [ ] **Step 1: Create `.gitignore`**

Create `.gitignore`:

```gitignore
node_modules/
package-lock.json
.DS_Store

# Generated blog post pages (produced at build time; index.html is hand-authored)
/blog/*.html
!/blog/index.html
```

- [ ] **Step 2: Verify git ignores the generated page**

Run: `git status --short`
Expected: `blog/tro-granted-pulte-lake-moor-july-2026.html` and `node_modules/` do NOT appear; `.gitignore` and `netlify.toml` (after next step) do.

- [ ] **Step 3: Add the build command to `netlify.toml`**

Change the `[build]` block at the top of `netlify.toml` from:

```toml
[build]
  publish = "."
```

to:

```toml
[build]
  command = "node build.js"
  publish = "."

[build.environment]
  NODE_VERSION = "20"
```

Leave the existing `[[redirects]]` blocks unchanged.

- [ ] **Step 4: Verify the build command works end-to-end**

Run: `rm -f blog/tro-granted-pulte-lake-moor-july-2026.html && npm run build`
Expected: prints `Generated 1 blog post page(s).` and recreates the file. This is exactly what Netlify will run on deploy.

- [ ] **Step 5: Commit**

```bash
git add .gitignore netlify.toml
git commit -m "Wire Netlify build to generate blog post pages"
```

---

## Verification (whole feature)

1. `npm install && npm run build` → prints the generated count; `blog/<slug>.html` exists for the post in `posts.json`.
2. `node --test` → all tests pass.
3. Open the generated post page locally: content, styles, nav, footer, and `<head>` metadata all correct.
4. From `blog/index.html`, the listing card link `/blog/<slug>.html` resolves to the generated page.
5. `git status` shows generated pages and `node_modules/` ignored; only source is tracked.
6. (Post-deploy, separate launch workstream) On the Netlify preview URL, confirm the post page loads and a social-share debugger shows the post-specific title/description/image.

## Notes / follow-ups (out of scope)

- Per-post OG image field in Decap CMS + template — future enhancement.
- Category archive pages, pagination, RSS — future enhancement.
- Netlify Identity + Git Gateway must be enabled in the Netlify UI for `/admin` to work — this belongs to the launch/verification workstream, not this plan.
