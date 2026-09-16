import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readPublicFile = (name) =>
  readFile(new URL(`../public/${name}`, import.meta.url), "utf8");

test("the home page presents the agreed identity and contact routes", async () => {
  const html = await readPublicFile("index.html");

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<h1>Kauri Markkanen<\/h1>/);
  assert.match(html, /Independent app builder and growth marketer/);
  assert.match(
    html,
    /Currently building <span class="wayfinder">Wayfinder<\/span>: mobile productivity software that helps people find their way around big ideas\./,
  );
  assert.match(html, /Available for select growth marketing work\./);
  assert.match(html, /href="mailto:hello@kaurimark\.com"/);
  assert.match(html, /href="https:\/\/x\.com\/kaurimark"/);
  assert.match(html, /© 2026 Kauri Markkanen/);
});

test("the home page is indexable and has canonical social metadata", async () => {
  const html = await readPublicFile("index.html");

  assert.match(
    html,
    /<title>Kauri Markkanen — Independent app builder and growth marketer<\/title>/,
  );
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"\s*>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/kaurimark\.com\/">/);
  assert.match(html, /<meta property="og:title" content="[^"]+">/);
  assert.match(html, /<meta\s+property="og:description"\s+content="[^"]+"\s*>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/kaurimark\.com\/">/);
  assert.match(html, /<meta name="twitter:card" content="summary">/);
  assert.doesNotMatch(html, /noindex|nofollow/i);
});

test("the public artifact does not add scripts or tracking", async () => {
  const html = await readPublicFile("index.html");

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /analytics|gtag|pixel|segment|plausible/i);
});

test("the Wayfinder highlight breathes over ten seconds and respects reduced motion", async () => {
  const css = await readPublicFile("styles.css");

  assert.match(css, /\.wayfinder\s*\{[^}]*animation:\s*wayfinder-breathe 10s[^}]*\}/s);
  assert.match(css, /@keyframes wayfinder-breathe/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wayfinder\s*\{[^}]*animation:\s*none/s);
});

test("crawler and response policy files preserve indexing and privacy", async () => {
  const [robots, headers] = await Promise.all([
    readPublicFile("robots.txt"),
    readPublicFile("_headers"),
  ]);

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Disallow:\s*\//);
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /Referrer-Policy: no-referrer/);
  assert.doesNotMatch(headers, /X-Robots-Tag:\s*(?:noindex|nofollow)/i);
});

test("the Cloudflare deployment targets the existing Worker and public assets", async () => {
  const config = JSON.parse(
    await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  );

  assert.equal(config.name, "kaurimark-site");
  assert.equal(config.compatibility_date, "2026-09-16");
  assert.equal(config.assets.directory, "./public/");
});
