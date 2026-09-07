import { spawnSync } from 'node:child_process';

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('npm_execpath is unavailable');

const result = spawnSync(process.execPath, [npmCli, 'run', 'build'], {
  cwd: process.cwd(),
  env: { ...process.env, NEXT_PUBLIC_API_URL: 'http://localhost:3101/api' },
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
