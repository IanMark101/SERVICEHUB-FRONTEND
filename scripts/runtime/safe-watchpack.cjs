/* eslint-disable @typescript-eslint/no-require-imports -- Node --require preloads run before ESM imports. */
const fs = require('node:fs');
const Module = require('node:module');

// Next 16.3.3's bundled Watchpack applies ignores after lstat during its
// initial scan. On Windows a watched ancestor can include protected entries.
function safeWatchpack(source) {
  const scan = 'for(const t of s){r.lstat(t,';
  if (source.split(scan).length !== 2) {
    throw new Error('Review the Windows Watchpack guard for this Next.js version.');
  }
  return source.replace(scan, 'for(const t of s){if(this.ignored(t)){c();continue}r.lstat(t,');
}

function installWatchpackGuard() {
  if (process.platform !== 'win32') return;
  const target = require.resolve('next/dist/compiled/watchpack').toLowerCase();
  const original = Module._extensions['.js'];
  Module._extensions['.js'] = function (module, filename) {
    if (filename.toLowerCase() !== target) return original(module, filename);
    Module._extensions['.js'] = original;
    return module._compile(safeWatchpack(fs.readFileSync(filename, 'utf8')), filename);
  };
}

module.exports = { safeWatchpack, installWatchpackGuard };
