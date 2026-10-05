import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const publicDir = resolve(import.meta.dirname, '../public');
const source = await readFile(resolve(publicDir, 'logo.svg'));

await writeFile(resolve(publicDir, 'favicon.svg'), source);
await writeFile(resolve(publicDir, 'logo.png'), await sharp(source).resize(512, 512).png().toBuffer());

const iconPng = await sharp(source).resize(256, 256).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(iconPng.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(resolve(publicDir, 'favicon.ico'), Buffer.concat([header, iconPng]));
