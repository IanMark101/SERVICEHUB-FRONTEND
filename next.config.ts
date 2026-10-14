import type { NextConfig } from "next";
import { join } from "node:path";
import AtomicDevManifestsPlugin from './scripts/plugins/atomic-dev-manifests.cjs';
import { FRONTEND_REDIRECT_HOSTS, PRODUCTION_SITE_ORIGIN } from './src/lib/site-origin';

const nextConfig: NextConfig = {
  // The local preview browser accesses the dev server through its loopback IP.
  allowedDevOrigins: ["127.0.0.1"],
  // Vercel supplies its own build adapter; standalone output is for Docker.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  async redirects() {
    return [
      ...FRONTEND_REDIRECT_HOSTS.map(host => ({
        source: '/:path*',
        has: [{ type: 'host' as const, value: host.replaceAll('.', '\\.') }],
        destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
        permanent: true,
      })),
      { source: '/help/getting-started/what-is-servicehub-cordova', destination: '/help/getting-started/what-is-servicehub', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; connect-src 'self'" },
        ],
      },
      {
        source: '/offline.html',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// Keep this workaround out of production/Turbopack. The dev launcher uses Webpack.
if (process.env.NODE_ENV === "development") {
  nextConfig.webpack = (config, { dev, isServer }) => {
    if (dev && process.platform === "win32") {
      // Module resolution can watch a drive ancestor. Skip protected Windows
      // entries during scanning, keeping Next's ignores. The dev launcher
      // preloads the guard that applies these ignores before Watchpack's lstat.
      const protectedFiles = /[\\/](?:System Volume Information|(?:swapfile|pagefile|hiberfil)\.sys)(?:[\\/]|$)/i;
      const existingIgnored = config.watchOptions?.ignored;
      config.watchOptions = {
        ...config.watchOptions,
        ignored: existingIgnored?.source
          ? new RegExp(`${existingIgnored.source}|${protectedFiles.source}`, [...new Set(`${existingIgnored.flags}i`)].join(""))
          : protectedFiles,
      };
      config.plugins = [...(config.plugins || []), new AtomicDevManifestsPlugin(join(process.cwd(), '.next', 'dev'))];
    }
    if (dev && !isServer) {
      config.module.rules.push({
        test: /[\\/]next[\\/]dist[\\/]compiled[\\/]mini-css-extract-plugin[\\/]hmr[\\/]hotModuleReplacement\.js$/,
        enforce: "pre",
        use: [{ loader: join(process.cwd(), "scripts/loaders/safe-css-hmr.cjs") }],
      });
    }
    return config;
  };
}

export default nextConfig;
