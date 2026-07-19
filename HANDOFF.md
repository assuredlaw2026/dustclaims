# Handoff: Contact Form (Web3Forms)

**Date:** 2026-07-18
**Commit:** `1ac7178`
**File touched:** `contact/index.html`

---

## What changed

The case review form was wired to **Netlify Forms**. It now uses **Web3Forms**, so it
works from any host rather than depending on Netlify.

| Before | After |
|---|---|
| `data-netlify="true"` + `form-name` hidden input | `access_key`, `subject`, `from_name` hidden inputs |
| POST to `/` (url-encoded) | POST to `https://api.web3forms.com/submit` (FormData) |
| `bot-field` honeypot (**never active**) | `botcheck` honeypot (enforced by Web3Forms) |
| — | `replyto` set from claimant email, so replies go straight to them |

### The bug that was fixed

The old handler showed the success message on **any** response:

```js
fetch('/', {...}).then(() => { /* show "Thank You" */ })
```

`fetch` only rejects on *network* failure. A 404, 403, or 500 resolves normally and
still hit `.then()`. So a visitor saw *"Your information has been received. An attorney
will follow up within one business day"* whether or not the submission landed — and the
firm had no signal that a claimant was lost.

The handler now checks both the HTTP status and the API's own success flag:

```js
if (!ok || body.success !== true) { fail(...); return; }
```

On failure it keeps the form visible, re-enables the submit button, and shows an inline
error telling the visitor to call (702) 825-3747.

---

## Verification status

**Read this before assuming the form works.**

| Path | Status |
|---|---|
| Failure path | ✅ **Verified** — real Chrome, real page. Success message correctly stayed hidden, form stayed visible, button reset, error shown. |
| Success path | ❌ **NOT verified** — no submission has ever been confirmed to reach the inbox. |

The success path could not be tested locally. Two blockers, neither a defect in the code:

1. **Server-side calls (curl) return 403.** Web3Forms requires the origin server's IP be
   whitelisted through their support, even on Pro.
2. **Web3Forms refuses plain-HTTP origins.** A `http://localhost` test is blocked by CORS
   (no `Access-Control-Allow-Origin` returned). Confirmed this is Web3Forms-specific: a
   control request from the same browser to another host returned 200 normally.

**Verifying the success path requires one real submission through the deployed HTTPS site.**
That is the single remaining open item.

---

## Two things that will look like "the form is broken"

### 1. The Netlify preview domain is a different origin

The access key has **domain restriction enabled**. If the allowlist contains only
`dustclaims.com` / `www.dustclaims.com`, then a deploy preview at `*.netlify.app` is a
*different origin* and Web3Forms will reject it. The form will display
*"We could not reach our servers"* — which looks like a broken integration but is just
the allowlist.

**To test on a preview URL:** temporarily add the `.netlify.app` domain to the allowlist
in the Web3Forms dashboard. Otherwise test only after DNS points at the real domain.

### 2. Spam protection is set to strict

A false positive on a legal intake form means a claimant believes they contacted a lawyer
and never hears back. Strict is a reasonable default given the key is public, but
**check the filtered/spam view in the Web3Forms dashboard during the first stretch of real
traffic.** If legitimate submissions are being caught, lower it to moderate.

---

## About the access key

`contact/index.html` contains the Web3Forms access key in plain text. **This is correct
and expected** — it is a public submission token that ships in client-side HTML, not a
secret. Anyone can read it via view-source on the live site.

Because it is public *and* this repo is public, **domain restriction is the only thing
preventing abuse.** It is currently enabled. If it is ever turned off, anyone can POST to
the form, burn the Pro plan quota, and bury real claimants in junk.

> It was briefly disabled during testing on 2026-07-18 and has since been restored.

---

## Deployment status

**Nothing in this repo is live.**

- `www.dustclaims.com` currently serves an **unfinished Wix site** (server header
  `Pepyaka`; nav links point at `/blank`, `/blank-1`, `/blank-2`, `/blank-3`).
- `/contact/` on the live domain **404s**. There is no `<form>` element on the live site.
- `dustclaims.netlify.app` also 404s — no Netlify deploy under that name.

So the contact form has never captured a submission, because nothing has been serving it.

### Remaining steps

1. **Connect this repo to Netlify.** `netlify.toml` already sets `publish = "."`, so no
   build config is needed.
2. **Decide whether this repo replaces the Wix site** at `dustclaims.com`. If yes, that is
   a DNS cutover, and it should be planned — it is the live domain for a firm taking
   intake.
3. **Verify the success path.** Submit once through the deployed HTTPS form and confirm it
   arrives in the Web3Forms inbox. Until this is done, treat the form as unproven.
