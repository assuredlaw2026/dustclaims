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
