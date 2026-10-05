import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// Check actual production HTML without executing JavaScript or calling the API.
for (const [route, heading] of [['login', 'Sign In'], ['register', 'Create an Account']]) {
  const html = readFileSync(new URL(`../.next/server/app/${route}.html`, import.meta.url), 'utf8');
  const document = new JSDOM(html).window.document;
  const form = document.querySelector('form');
  assert.ok(form, `/${route} must render its form before session recovery`);
  assert.ok([...document.querySelectorAll('h2')].some(node => node.textContent === heading));
  assert.ok(form.querySelector('input[type="email"]'), `/${route} must include its email field`);
  assert.ok(form.querySelector('input[type="password"]'), `/${route} must include its password field`);
  assert.equal(document.querySelector('.brand-loading--page'), null, `/${route} must not render a full-page loader`);
  for (let node = form; node; node = node.parentElement) {
    assert.ok(!node.hasAttribute('hidden'), `/${route} must not wait in a hidden streaming container`);
    assert.notEqual(node.style.display, 'none');
    assert.notEqual(node.style.opacity, '0');
  }
}
console.log('Login and registration production HTML passed: visible forms before JavaScript/session recovery, no full-page loader.');
