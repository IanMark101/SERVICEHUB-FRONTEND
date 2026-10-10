import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // The local preview browser accesses the dev server through its loopback IP.
  allowedDevOrigins: ["127.0.0.1"],
  // Vercel supplies its own build adapter; standalone output is for Docker.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  async redirects() {
    return [{ source: '/help/getting-started/what-is-servicehub-cordova', destination: '/help/getting-started/what-is-servicehub', permanent: true }];
  },
  async headers() {
    return [
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
