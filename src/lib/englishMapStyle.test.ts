import { describe, expect, it } from 'vitest';
import { expression } from '@maplibre/maplibre-gl-style-spec';
import type { StyleSpecification } from 'maplibre-gl';
import { ENGLISH_MAP_LABEL, englishMapStyle } from './englishMapStyle';

function label(properties:Record<string,string>) {
  const compiled = expression.createExpression(ENGLISH_MAP_LABEL, 'layers[0].layout.text-field');
  if (compiled.result === 'error') throw new Error(JSON.stringify(compiled.value));
  return compiled.value.evaluate({zoom:6}, {type:1, properties, geometry:[]});
}

describe('readable map labels', () => {
  it('prefers English and uses Latin transliterations instead of adding native-script labels', () => {
    expect(label({'name:en':'Beijing','name:latin':'Běijīng','name:nonlatin':'北京',name:'北京'})).toBe('Beijing');
    expect(label({'name:latin':'Běijīng','name:nonlatin':'北京',name:'北京'})).toBe('Běijīng');
    expect(label({'name:latin':'Tōkyō','name:nonlatin':'東京',name:'東京'})).toBe('Tōkyō');
    expect(label({'name:nonlatin':'北京',name:'北京',name_en:'北京',name_int:'北京'})).toBe('');
    expect(label({'name:nonlatin':'澜溪街',name:'澜溪街',name_en:'澜溪街',name_int:'澜溪街'})).toBe('');
    expect(label({name:'Cordova'})).toBe('Cordova');
  });

  it('preserves road numbers, map styling and the original provider style object', () => {
    const style:StyleSpecification = {version:8,sources:{places:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},layers:[
      {id:'land',type:'background',paint:{'background-color':'#fff'}},
      {id:'city',type:'symbol',source:'places',layout:{'text-field':['get','name'],'text-size':14}},
      {id:'road-shield',type:'symbol',source:'places',layout:{'text-field':['to-string',['get','ref']]}},
    ]};
    const localized = englishMapStyle(style);
    expect(localized.layers[0]).toBe(style.layers[0]);
    expect(localized.layers[2]).toBe(style.layers[2]);
    expect(localized.layers[1]).toMatchObject({layout:{'text-field':ENGLISH_MAP_LABEL,'text-size':14}});
    expect(style.layers[1]).toMatchObject({layout:{'text-field':['get','name']}});
  });
});
