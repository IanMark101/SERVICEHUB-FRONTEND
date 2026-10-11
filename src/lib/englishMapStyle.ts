import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

// OpenMapTiles supplies translated names and Latin transliterations separately.
// Keep a readable native name only when the data does not mark it as non-Latin.
export const ENGLISH_MAP_LABEL: ExpressionSpecification = [
  'coalesce',
  ['get', 'name:en'],
  ['get', 'name:latin'],
  // Legacy "international" names can repeat the untranslated native name.
  ['case', ['has', 'name:nonlatin'], '', ['coalesce', ['get', 'name_int'], ['get', 'name_en'], ['get', 'name'], '']],
  '',
];

export function englishMapStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map(layer => {
      if (layer.type !== 'symbol' || !layer.layout?.['text-field']) return layer;
      const field = layer.layout['text-field'];
      // Leave road shields, route numbers and other non-name labels intact.
      if (!/"name(?::[\w-]+|_en|_int)?"|\{name(?::[\w-]+|_en|_int)?\}/.test(JSON.stringify(field))) return layer;
      return { ...layer, layout: { ...layer.layout, 'text-field': ENGLISH_MAP_LABEL } };
    }),
  };
}
