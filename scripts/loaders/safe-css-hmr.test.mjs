import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';
import ts from 'typescript';
import safeCssHmr from './safe-css-hmr.cjs';

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

const runtime = fs.readFileSync(require.resolve('next/dist/compiled/mini-css-extract-plugin/hmr/hotModuleReplacement.js'), 'utf8');

function setup(source) {
  const dom = new JSDOM('<!doctype html><head><link rel="stylesheet" href="http://localhost:3000/_next/static/css/page.css"></head>', {
    url: 'http://localhost:3000', virtualConsole: new VirtualConsole(),
  });
  const errors = [], callbacks = [], moduleRef = { exports: {} };
  dom.window.addEventListener('error', event => { errors.push(event.error); event.preventDefault(); });
  vm.runInNewContext(source, {
    document: dom.window.document, module: moduleRef, __dirname: '', console: { log() {} },
    setTimeout: callback => { callbacks.push(callback); return callbacks.length; }, clearTimeout() {},
  }, { filename: 'next-css-hotModuleReplacement.js' });
  moduleRef.exports('regression', {})();
  callbacks.forEach(callback => callback());
  const [original, replacement] = dom.window.document.querySelectorAll('link');
  return { dom, errors, original, replacement };
}

test('reproduces the installed runtime crash when an old stylesheet is detached before completion', () => {
  const { dom, errors, original, replacement } = setup(runtime);
  try {
    original.remove();
    replacement.dispatchEvent(new dom.window.Event('load'));
    assert.match(errors[0]?.message || '', /Cannot read properties of null.*removeChild/);
  } finally { dom.window.close(); }
});

for (const completion of ['load', 'error']) {
  test(`late ${completion} after stylesheet removal is safe and leaves the replacement connected`, () => {
    const { dom, errors, original, replacement } = setup(safeCssHmr(runtime));
    try {
      original.remove();
      replacement.dispatchEvent(new dom.window.Event(completion));
      assert.deepEqual(errors, []);
      assert.equal(replacement.isConnected, true);
      assert.equal(dom.window.document.querySelectorAll('link').length, 1);
    } finally { dom.window.close(); }
  });
}

test('normal refresh removes the original, retains the replacement, and tolerates duplicate completion events', () => {
  const { dom, errors, original, replacement } = setup(safeCssHmr(runtime));
  try {
    assert.equal(original.isConnected, true);
    assert.equal(replacement.isConnected, true);
    replacement.dispatchEvent(new dom.window.Event('load'));
    replacement.dispatchEvent(new dom.window.Event('load'));
    replacement.dispatchEvent(new dom.window.Event('error'));
    assert.equal(original.isConnected, false);
    assert.equal(replacement.isConnected, true);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

function configFor(environment) {
  const source = fs.readFileSync(path.join(projectRoot, 'next.config.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const moduleRef = { exports: {} };
  vm.runInNewContext(compiled, {
    module: moduleRef, exports: moduleRef.exports, require,
    process: { env: { NODE_ENV: environment }, cwd: () => projectRoot },
  });
  return moduleRef.exports.default;
}

test('webpack guard is scoped to the development browser CSS HMR module', () => {
  const config = configFor('development');
  const webpackConfig = { module: { rules: [] } };
  assert.equal(config.webpack(webpackConfig, { dev: true, isServer: false }), webpackConfig);
  assert.equal(webpackConfig.module.rules.length, 1);
  const rule = webpackConfig.module.rules[0];
  assert.equal(rule.test.test(require.resolve('next/dist/compiled/mini-css-extract-plugin/hmr/hotModuleReplacement.js')), true);
  assert.equal(rule.test.test('/app/src/components/location/LocationMap.tsx'), false);
  assert.equal(rule.test.test('/app/src/app/globals.css'), false);
  assert.equal(fs.existsSync(rule.use[0].loader), true);
  for (const context of [{ dev: true, isServer: true }, { dev: false, isServer: false }]) {
    const untouched = { module: { rules: [] } };
    config.webpack(untouched, context);
    assert.equal(untouched.module.rules.length, 0);
  }
});

test('production retains the default bundler configuration', () => {
  assert.equal(configFor('production').webpack, undefined);
});
