import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import test from 'node:test';
import guards from './safe-watchpack.cjs';

const require = createRequire(import.meta.url);
const runtime = fs.readFileSync(require.resolve('next/dist/compiled/watchpack'), 'utf8');
const protectedFiles = /[\\/](?:System Volume Information|swapfile\.sys)(?:[\\/]|$)/i;

async function initialScan(source) {
  const stats = [], errors = [];
  const fakeFs = {
    ...fs,
    readdir(_directory, options, callback) {
      if (typeof options === 'function') callback = options;
      process.nextTick(() => callback(null, ['System Volume Information', 'swapfile.sys', 'ordinary.txt']));
    },
    lstat(file, options, callback) {
      if (typeof options === 'function') callback = options;
      stats.push(file);
      process.nextTick(() => callback(protectedFiles.test(file)
        ? Object.assign(new Error(`EINVAL: invalid argument, lstat '${file}'`), { code: 'EINVAL' })
        : null, { isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false, mtime: new Date(), ctime: new Date() }));
    },
    watch() { const watcher = new EventEmitter(); watcher.close = () => {}; return watcher; },
  };
  const moduleRef = { exports: {} };
  vm.runInNewContext(source, {
    module: moduleRef, exports: moduleRef.exports, __dirname: '.', RegExp, Function,
    require: name => name === 'fs' ? fakeFs : require(name), process, Buffer, global: {},
    console: { error: message => errors.push(message) }, setTimeout, clearTimeout, setImmediate,
  }, { filename: 'watchpack-fixture.js' });
  const watcher = new moduleRef.exports({ ignored: protectedFiles });
  watcher.watch({ files: ['C:\\ordinary.txt'], startTime: Date.now() });
  await new Promise(resolve => setTimeout(resolve, 20));
  watcher.close();
  return { stats, errors };
}

test('installed Watchpack reproduces Windows initial-scan errors despite configured ignores', async () => {
  const { stats, errors } = await initialScan(runtime);
  assert.equal(stats.some(file => protectedFiles.test(file)), true);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /Watchpack Error \(initial scan\)/);
});

test('the guarded initial scan skips protected entries and continues observing ordinary files', async () => {
  const { stats, errors } = await initialScan(guards.safeWatchpack(runtime));
  assert.deepEqual(errors, []);
  assert.equal(stats.some(file => protectedFiles.test(file)), false);
  assert.equal(stats.some(file => file.endsWith('ordinary.txt')), true);
});

test('an incompatible framework runtime requires an explicit guard review', () => {
  assert.throws(() => guards.safeWatchpack('different runtime'), /Review the Windows Watchpack guard/);
});
