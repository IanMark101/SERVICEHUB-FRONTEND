import assert from 'node:assert/strict';
import { get } from 'node:http';

// Read-only release check; never signs in or writes user/application data.
const origin = new URL(process.argv[2] || 'https://www.servicehub.bond').origin;
const canonicalOrigin = 'https://www.servicehub.bond';
const local = new URL(origin).hostname === '127.0.0.1' || new URL(origin).hostname === 'localhost';
const review = [];

async function read(path, options = {}) {
  const response = await fetch(new URL(path, origin), {
    ...options, headers: { 'User-Agent': 'Googlebot', ...options.headers }, signal: AbortSignal.timeout(20000),
  });
  return { response, body: await response.text() };
}
function localHostResponse(host, path) {
  // Fetch normalizes Host; a raw local HTTP request is needed to exercise
  // Next's actual Host matcher, without changing DNS or contacting that host.
  return new Promise((resolve, reject) => {
    const request = get(new URL(path, origin), { headers: { Host: host }, signal: AbortSignal.timeout(20000) }, response => {
      response.resume();
      resolve({ status: response.statusCode, location: response.headers.location });
    });
    request.on('error', reject);
  });
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1], match[2].replaceAll('&amp;', '&')]));
}
function metadata(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0]))
    .find(item => item.name === name || item.property === name)?.content;
}
function canonical(html) {
  return [...html.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]))
    .find(item => item.rel === 'canonical')?.href;
}

try {
  const robots = await read('/robots.txt');
  assert.equal(robots.response.status, 200);
  assert.match(robots.body, /Sitemap: https:\/\/www\.servicehub\.bond\/sitemap.xml/);
  const sitemap = await read('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const urls = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.length > 2);
  for (const url of urls) {
    assert.equal(new URL(url).origin, canonicalOrigin);
    assert.ok(url === `${canonicalOrigin}/` || url === canonicalOrigin || new URL(url).pathname.startsWith('/help'));
    assert.equal(new URL(url).search, '');
  }
  review.push({ check: 'robots and sitemap', publicUrls: urls.length });

  const category = urls.find(url => new URL(url).pathname.split('/').filter(Boolean).length === 2);
  const article = urls.find(url => new URL(url).pathname.split('/').filter(Boolean).length === 3);
  assert.ok(category && article);
  for (const path of ['/', '/help', new URL(category).pathname, new URL(article).pathname]) {
    const { response, body } = await read(path);
    assert.equal(response.status, 200, path);
    assert.ok(/<title>[^<]+<\/title>/.test(body), `${path} title`);
    assert.ok(metadata(body, 'description'), `${path} description`);
    assert.equal(new URL(canonical(body)).href, new URL(path, canonicalOrigin).href, `${path} canonical`);
    assert.equal(new URL(metadata(body, 'og:url')).href, new URL(path, canonicalOrigin).href);
    assert.equal(metadata(body, 'robots'), 'index, follow');
    assert.equal(metadata(body, 'twitter:card'), 'summary_large_image');
    assert.equal(new URL(metadata(body, 'og:image')).origin, canonicalOrigin);
    const schemas = [...body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
    if (path !== '/help') assert.ok(schemas.length, `${path} structured data`);
    for (const match of schemas) {
      const schema = JSON.parse(match[1]);
      assert.ok(!JSON.stringify(schema).includes('servicehubcordova.tech'), `${path} retired schema URL`);
    }
    review.push({ path, status: response.status, canonical: canonical(body), robots: metadata(body, 'robots') });
  }
  for (const path of ['/login', '/register', '/seeker/seek-services', '/provider/service-manager', '/admin/audit-logs', '/help/search', '/terms', '/privacy', '/install']) {
    const { response, body } = await read(path);
    assert.equal(response.status, 200, path);
    assert.match(metadata(body, 'robots') || '', /noindex/, `${path} indexing boundary`);
    assert.equal(canonical(body), undefined, `${path} must not inherit the home canonical`);
    review.push({ path, status: response.status, robots: metadata(body, 'robots') });
  }
  if (local) {
    for (const host of ['servicehubcordova.tech', 'www.servicehubcordova.tech', 'servicehub.bond']) {
      const response = await localHostResponse(host, '/help?domain-check=1');
      assert.equal(response.status, 308, host);
      assert.equal(response.location, `${canonicalOrigin}/help?domain-check=1`);
      review.push({ check: 'alias redirect', host, status: response.status });
    }
    const response = await localHostResponse('www.servicehub.bond', '/help');
    assert.equal(response.status, 200, 'primary host must not redirect to itself');
  }
  console.log(JSON.stringify({ passed: true, origin, review }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: false, origin, review, error: error.message }, null, 2));
  process.exitCode = 1;
}
