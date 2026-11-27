import path from 'path';
import fs from 'fs';

const nestedPdfMin = path.resolve(
  process.cwd(),
  'node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.min.mjs'
);
const rootPdfMin = path.resolve(
  process.cwd(),
  'node_modules/pdfjs-dist/build/pdf.min.mjs'
);
const pdfjsEntry = fs.existsSync(nestedPdfMin) ? nestedPdfMin : rootPdfMin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@blocknote/core',
      '@blocknote/react',
      '@blocknote/mantine',
      'framer-motion',
    ],
  },

  // ── COOP/COEP headers required for SharedArrayBuffer (WASM Web Workers) ────
  async headers() {
    return [
      {
        source: '/((?!java|minijuegos).*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
      {
        source: '/core/busytex/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/tldraw-assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/java',
        destination: '/java/index.html',
      },
      {
        source: '/java-classroom',
        destination: '/java/index.html',
      },
    ];
  },

  // ── Webpack: allow texlyre-busytex ESM package and WASM files ────────────
  webpack(config, { isServer }) {
    if (!isServer) {
      // Don't bundle the large WASM assets — they are served from /public/core
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
      'pdfjs-dist$': pdfjsEntry,
    };

    // Allow importing .wasm files as URLs
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;

