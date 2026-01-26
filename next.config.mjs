import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for WASM loading
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Handle fontmin and its dependencies
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'fontmin': 'commonjs fontmin',
        'ttf2woff2': 'commonjs ttf2woff2',
        'archiver': 'commonjs archiver',
      });
    }

    return config;
  },
}

export default nextConfig

