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
