import type { FilterSpecification, StyleSpecification } from 'maplibre-gl';

const orderedComparisons = new Set(['>', '>=', '<', '<=']);

function propertyRead(value: unknown): value is ['get', string] {
  return Array.isArray(value) && value.length === 2 && value[0] === 'get' && typeof value[1] === 'string';
}

function safeFilter(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  // Keep literals and legacy filters untouched. Only ordered comparisons with
  // an explicit number establish that a feature property must be numeric.
  if (value[0] === 'literal') return value;
  if (orderedComparisons.has(value[0]) && value.length === 3) {
    const index = propertyRead(value[1]) && typeof value[2] === 'number' ? 1
      : propertyRead(value[2]) && typeof value[1] === 'number' ? 2 : -1;
    if (index !== -1) {
      const property = value[index];
      const comparison = [...value];
      comparison[index] = ['number', property, 0];
      // Missing/null/string values are excluded, rather than turning into zero
      // and accidentally passing an upper-bound filter. The number fallback
      // also remains safe if the renderer evaluates the comparison separately.
      return ['all', ['==', ['typeof', property], 'number'], comparison];
    }
  }
  return value.map(safeFilter);
}

/** Some upstream tiles omit admin_level/rank. Avoid worker warnings without
 * suppressing console errors or changing valid boundary/label selection. */
export function safeMapFilters(style: StyleSpecification): StyleSpecification {
  return { ...style, layers: style.layers.map(layer => 'filter' in layer && layer.filter
    ? { ...layer, filter: safeFilter(layer.filter) as FilterSpecification } : layer) };
}
