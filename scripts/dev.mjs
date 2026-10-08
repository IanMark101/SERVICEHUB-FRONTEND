import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

// Windows accepts differently cased terminal paths. Resolve the native spelling
// before loading Next so its router context is not bundled under two paths.
const projectRoot = realpathSync.native(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
process.chdir(projectRoot);
const require = createRequire(resolve(projectRoot, 'package.json'));
const nextCli = realpathSync.native(require.resolve('next/dist/bin/next'));
const child = spawn(process.execPath, [nextCli, 'dev', '--webpack', projectRoot, ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, PWD: projectRoot },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { if (!child.killed) child.kill(signal); });
}
child.on('error', error => {
  console.error('Could not start the frontend:', error.message);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1);
});
