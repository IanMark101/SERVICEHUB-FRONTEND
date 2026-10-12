import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// Each deployment needs different worker bytes so an existing installation
// receives an update prompt even when only application code has changed.
const template = await readFile(new URL('../src/pwa/service-worker.js', import.meta.url), 'utf8');
if (!template.includes('__SERVICEHUB_BUILD__')) throw new Error('Missing service-worker build marker');
await writeFile(new URL('../public/sw.js', import.meta.url), template.replaceAll('__SERVICEHUB_BUILD__', randomUUID()));
console.log('ServiceHub PWA worker prepared.');
