import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Theme color utility coverage', () => {
  it('does not reference undefined color shades that silently leave UI unstyled', () => {
    const root = join(process.cwd(), 'src');
    const globals = readFileSync(join(root, 'app/globals.css'), 'utf8');
    const custom = new Set([...globals.matchAll(/--color-([a-z]+-\d+)\s*:/g)].map(match => match[1]));
    const shades = new Set([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    const undefinedColors: string[] = [];
    function scan(directory: string) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) { scan(file); continue; }
        if (!/\.(tsx|css)$/.test(file) || file.endsWith('.test.tsx')) continue;
        const source = readFileSync(file, 'utf8');
        for (const match of source.matchAll(/(?:bg|text|border|ring|divide|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+)/g)) {
          if (!shades.has(Number(match[2])) && !custom.has(`${match[1]}-${match[2]}`)) undefinedColors.push(`${file}: ${match[0]}`);
        }
      }
    }
    scan(root);
    expect(undefinedColors).toEqual([]);
  });
});
