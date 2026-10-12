import { describe, expect, it } from 'vitest';
import { mapAreaAnchor, parseMapPins, providerMapQueries } from './marketplace-map';

describe('public marketplace map areas',()=>{
  it('covers a wider viewport independently of the selected search circle and wraps the date line',()=>{
    const plan=providerMapQueries({center:{latitude:10.3,longitude:123.9},bounds:{north:10.8,south:10,east:124.3,west:123.5}});
    expect(plan.limited).toBe(false);
    expect(plan.centers.length).toBeGreaterThan(1);
    expect(plan.centers.length).toBeLessThanOrEqual(16);
    // A provider roughly 50 km from the search center is covered by a visible-map query.
    const provider={latitude:10.7,longitude:124.2};
    expect(plan.centers.some(center=>Math.hypot((provider.latitude-center.latitude)*111.2,(provider.longitude-center.longitude)*109)<30)).toBe(true);
    expect(Math.hypot((provider.latitude-10.3)*111.2,(provider.longitude-123.9)*109)).toBeGreaterThan(30);
    const wrapped=providerMapQueries({center:{latitude:0,longitude:179.99},bounds:{north:.1,south:-.1,east:-179.9,west:179.9}});
    expect(wrapped.limited).toBe(false);
    expect(wrapped.centers).toHaveLength(1);
    expect(Math.abs(wrapped.centers[0].longitude)).toBe(180);
  });
  it('bounds requests on world-scale maps and rejects unusable layout bounds',()=>{
    const world=providerMapQueries({center:{latitude:10.3,longitude:123.9},bounds:{north:80,south:-80,east:180,west:-180}});
    expect(world.limited).toBe(true);
    expect(world.centers).toHaveLength(1);
    expect(world.centers[0].longitude).toBeCloseTo(123.9);
    expect(providerMapQueries({center:{latitude:10.3,longitude:123.9},bounds:{north:NaN,south:10,east:124,west:123}}).centers).toEqual([]);
  });
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
