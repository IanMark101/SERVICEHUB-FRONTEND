import { describe, expect, it } from 'vitest';
import { mapAreaAnchor, parseMapPins } from './marketplace-map';

describe('public marketplace map areas',()=>{
  it('rejects exact or invalid positions and strips unrelated private fields',()=>{
    const pin={id:'a',title:'Plumbing',label:'Cordova',area:{latitude:10.3,longitude:123.9,approximate:true}};
    expect(parseMapPins([pin,{...pin,area:{...pin.area,approximate:false}},{...pin,area:{...pin.area,latitude:91}},null])).toEqual([pin]);
    expect(parseMapPins([{...pin,privateAddress:'Private',area:{...pin.area,address:'Private'}}])).toEqual([pin]);
    expect(parseMapPins(undefined)).toEqual([]);
  });
  it.each([.5,1,2.3,30])('keeps coarse area anchors inside a %s km circle, including the date line',radiusKm=>{
    for(const point of [{latitude:10.3009,longitude:123.9009,label:'Cordova'},{latitude:0,longitude:179.999,label:'Date line'},{latitude:89.99,longitude:0,label:'Near pole'}]) {
      for(const area of [{latitude:point.latitude+.01>90?90:point.latitude+.01,longitude:point.longitude-.02,approximate:true as const},{latitude:0,longitude:-179.99,approximate:true as const}]) {
        const result=mapAreaAnchor(area,{point,radiusKm});
        const r=Math.PI/180;
        const h=Math.sin((result.latitude-point.latitude)*r/2)**2+Math.cos(point.latitude*r)*Math.cos(result.latitude*r)*Math.sin((result.longitude-point.longitude)*r/2)**2;
        const distance=2*6371.0088*Math.asin(Math.sqrt(Math.min(1,h)));
        expect(distance).toBeLessThanOrEqual(radiusKm+.000001);
        expect(result.latitude).toBeGreaterThanOrEqual(-90);expect(result.latitude).toBeLessThanOrEqual(90);
        expect(result.longitude).toBeGreaterThanOrEqual(-180);expect(result.longitude).toBeLessThanOrEqual(180);
      }
    }
  });
});
