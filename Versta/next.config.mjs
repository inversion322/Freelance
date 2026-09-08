import { fileURLToPath } from 'node:url';
import path from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
export default {
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};
