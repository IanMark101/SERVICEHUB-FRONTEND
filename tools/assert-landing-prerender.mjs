import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// Run after `next build`. Do not execute scripts: the initial server HTML must
// already contain visible landing content before hydration or session requests.
const html = readFileSync(new URL('../.next/server/app/index.html', import.meta.url), 'utf8');
const document = new JSDOM(html).window.document;
const main = document.querySelector('main');
assert.ok(main, 'The landing page must have a main body in its initial HTML');
assert.equal(main.querySelector('h1')?.textContent.trim(), 'ServiceHub Cordova');
assert.equal(document.querySelector('.brand-loading'), null, 'The public root must not emit a page loader');
assert.equal(document.querySelector('[role="status"]'), null, 'The public root must not emit a loading status');
assert.ok(!document.querySelector('header')?.textContent.includes('Checking session'));
assert.ok(document.querySelector('header')?.textContent.includes('Get started'), 'Initial account action must be Get started');
assert.ok(!document.querySelector('header')?.textContent.includes('Open ServiceHub'), 'Pending recovery must not flash a temporary account label');
assert.ok(!document.querySelector('header')?.textContent.includes('Open workspace'), 'Initial HTML must not claim an unconfirmed session');
const accountActions = document.querySelectorAll('a[href="/get-started"]');
assert.equal(accountActions.length, 3, 'Header, hero, and final CTA need real session-aware links before hydration');
for (const action of accountActions) assert.match(action.textContent, /Get started/);
for (const id of ['top', 'problem', 'how-it-works', 'workspaces', 'queue', 'trust', 'comparison', 'community', 'reviews', 'faq']) {
  const section = main.querySelector(`#${id}`);
  assert.ok(section, `${id} must render in the initial HTML`);
  for (let node = section; node; node = node.parentElement) {
    assert.ok(!node.hasAttribute('hidden'), `${id} must not wait in a hidden streaming container`);
    assert.notEqual(node.style.display, 'none', `${id} must not be hidden`);
    assert.notEqual(node.style.opacity, '0', `${id} must not wait for animation initialization`);
  }
}
assert.ok(main.querySelector('footer'), 'The footer must render in the initial HTML');
console.log('Landing production HTML passed: complete visible body and three usable account links before hydration.');
