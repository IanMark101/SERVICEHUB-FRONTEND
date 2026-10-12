import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'ServiceHub', short_name: 'ServiceHub',
    description: 'Find local services and manage your Seeker and Provider workspaces.',
    start_url: '/', scope: '/', display: 'standalone', lang: 'en',
    background_color: '#0a0a0a', theme_color: '#0a0a0a',
    icons: [
      { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Seeker workspace', short_name: 'Seeker', url: '/seeker/seek-services', icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }] },
      { name: 'Provider workspace', short_name: 'Provider', url: '/provider/browse-services', icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
