import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packageFile = require.resolve('maplibre-gl/package.json');
const { version } = JSON.parse(await readFile(packageFile, 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Unexpected MapLibre version');
const destination = new URL(`../public/maplibre/${version}/`, import.meta.url);
await mkdir(destination, { recursive: true });
// v6 separates its ESM worker and shared module. Keep both on our origin,
// matched to the installed version rather than relying on bundler auto-detection.
for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(join(dirname(packageFile), 'dist', name), new URL(name, destination));
}
await copyFile(join(dirname(packageFile), 'LICENSE.txt'), new URL('LICENSE.txt', destination));
console.log(`ServiceHub map worker prepared (${version}).`);
