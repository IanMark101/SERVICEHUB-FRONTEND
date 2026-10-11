/* eslint-disable @next/next/no-img-element -- ImageResponse renders native image elements on the server. */
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSiteOrigin } from '@/lib/seo';

export const alt = 'ServiceHub — find nearby services and connect with local providers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'));
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#fffdfa', padding: '54px 64px', borderTop: '12px solid #ff6b00', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={`data:image/png;base64,${logo.toString('base64')}`} alt="" width={64} height={64} />
          <span style={{ fontSize: 36, fontWeight: 700 }}>ServiceHub</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 60, fontSize: 76, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-2px' }}>
          <span>Find nearby services.</span>
          <span style={{ color: '#ff974d' }}>Connect locally.</span>
        </div>
        <p style={{ marginTop: 26, fontSize: 26, lineHeight: 1.5, color: '#d2cdc6' }}>
          Compare providers. Post requests. Follow your bookings.
        </p>
        <div style={{ display: 'flex', marginTop: 'auto', paddingTop: 26, borderTop: '1px solid #353431', color: '#d2cdc6', fontSize: 22 }}>
          {new URL(getSiteOrigin()).host}
        </div>
      </div>
    ),
    size,
  );
}
