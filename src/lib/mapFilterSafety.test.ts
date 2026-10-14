import { expression } from '@maplibre/maplibre-gl-style-spec';
import type { StyleSpecification } from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';
import { safeMapFilters } from './mapFilterSafety';

function style(filter: unknown): StyleSpecification {
  return { version: 8, sources: {}, layers: [{ id: 'boundary', type: 'line', source: 'tiles', filter }] } as StyleSpecification;
}
function safe(filter: unknown) {
  const layer = safeMapFilters(style(filter)).layers[0];
  return 'filter' in layer ? layer.filter : undefined;
}
function evaluate(filter: unknown, properties: Record<string, unknown>) {
  const compiled = expression.createExpression(filter);
  if (compiled.result === 'error') throw new Error(JSON.stringify(compiled.value));
  return compiled.value.evaluate({ zoom: 12 }, { type: 2, properties, geometry: [] });
}

describe('missing numeric map feature properties', () => {
  it('handles the upstream boundary range without warning or including missing values', () => {
    const original = style(['all', ['>=', ['get', 'admin_level'], 3], ['<=', ['get', 'admin_level'], 6]]);
    const layer = safeMapFilters(original).layers[0];
    const filter = 'filter' in layer ? layer.filter : undefined;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      for (const properties of [{}, { admin_level: null }, { admin_level: '4' }]) expect(evaluate(filter, properties)).toBe(false);
      for (const level of [3, 4, 6]) expect(evaluate(filter, { admin_level: level })).toBe(true);
      for (const level of [0, 2, 7]) expect(evaluate(filter, { admin_level: level })).toBe(false);
      expect(warn).not.toHaveBeenCalled();
      expect(original.layers[0]).toMatchObject({ filter: ['all', ['>=', ['get', 'admin_level'], 3], ['<=', ['get', 'admin_level'], 6]] });
    } finally { warn.mockRestore(); }
  });

  it('guards country rank and reversed upper bounds while retaining valid numbers', () => {
    for (const filter of [['>=', ['get', 'rank'], 3], ['>', 7, ['get', 'rank']]]) {
      expect(evaluate(safe(filter), {})).toBe(false);
      expect(evaluate(safe(filter), { rank: null })).toBe(false);
      expect(evaluate(safe(filter), { rank: 4 })).toBe(true);
    }
  });

  it('preserves string comparisons, legacy filters, literal payloads and unrelated styling', () => {
    for (const filter of [['>=', ['get', 'name'], 'A'], ['>=', 'rank', 3], ['==', ['get', 'class'], 'country'], ['literal', ['>=', ['get', 'rank'], 3]]]) {
      expect(safe(filter)).toEqual(filter);
    }
  });
});
