import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import test from 'node:test';
import AtomicDevManifestsPlugin from './atomic-dev-manifests.cjs';

const require = createRequire(import.meta.url);
const readerPath = require.resolve('next/dist/server/load-manifest.external');
const readerRequire = createRequire(readerPath);
const devDirectory = path.resolve('.next/dev');
const manifest = path.join(devDirectory, 'server/app-paths-manifest.json');

function fixture({ writeError, renameError } = {}) {
  const files = new Map([[manifest, '{"/login":"old.js"}']]);
  const writes = [];
  const fileSystem = {
    writeFile(file, contents, options, callback) {
      if (typeof options === 'function') callback = options;
      writes.push(file);
      files.set(file, '');
      setImmediate(() => { files.set(file, contents); callback(writeError || null); });
    },
    rename(from, to, callback) {
      if (!renameError) { files.set(to, files.get(from)); files.delete(from); }
      callback(renameError || null);
    },
    unlink(file, callback) { files.delete(file); callback(null); },
  };
  const moduleRef = { exports: {} };
  vm.runInNewContext(fs.readFileSync(readerPath, 'utf8'), {
    module: moduleRef, exports: moduleRef.exports, process, JSON,
    require: name => name === 'fs' ? { readFileSync: file => files.get(file) } : readerRequire(name),
  });
  return { files, writes, fileSystem, read: () => moduleRef.exports.loadManifest(manifest, false) };
}

function guard(fileSystem) {
  new AtomicDevManifestsPlugin(devDirectory).apply({ outputFileSystem: fileSystem, hooks: {
    afterEnvironment: { tap(_name, callback) { callback(); } },
  } });
}

test('Next manifest reader reproduces the JSON error during a normal Webpack write', async () => {
  const state = fixture();
  const write = new Promise(resolve => state.fileSystem.writeFile(manifest, '{"/login":"new.js"}', resolve));
  assert.throws(state.read, /Unexpected end of JSON input/);
  await write;
  assert.equal(state.read()['/login'], 'new.js');
});

test('requests see complete old or new manifests throughout publication', async () => {
  const state = fixture();
  guard(state.fileSystem);
  guard(state.fileSystem); // Client and server compilers share an output filesystem.
  const write = new Promise((resolve, reject) => state.fileSystem.writeFile(manifest, '{"/login":"new.js"}', { encoding: 'utf8' }, error => error ? reject(error) : resolve()));
  assert.equal(state.read()['/login'], 'old.js');
  await write;
  assert.equal(state.read()['/login'], 'new.js');
  assert.equal(state.writes.length, 1);
  assert.equal(state.files.size, 1);
});

for (const failure of ['writeError', 'renameError']) {
  test(`${failure} preserves the previous manifest, cleans up and reports the failure`, async () => {
    const expected = new Error(failure);
    const state = fixture({ [failure]: expected });
    guard(state.fileSystem);
    const error = await new Promise(resolve => state.fileSystem.writeFile(manifest, '{}', resolve));
    assert.equal(error, expected);
    assert.equal(state.read()['/login'], 'old.js');
    assert.equal(state.files.size, 1);
  });
}

test('production manifests, application JSON and compiled scripts keep their existing write behavior', async () => {
  const state = fixture();
  guard(state.fileSystem);
  const paths = [path.resolve('.next/server/app-paths-manifest.json'), path.join(devDirectory, 'data.json'), path.join(devDirectory, 'page.js')];
  for (const file of paths) await new Promise(resolve => state.fileSystem.writeFile(file, '{}', resolve));
  assert.deepEqual(state.writes, paths);
});
