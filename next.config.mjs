/** @type {import('next').NextConfig} */
import withBundleAnalyzer from "@next/bundle-analyzer";
import withSerwistInit from "@serwist/next";

const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256],
  },
  // 静的アセットの圧縮
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion/react'],
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 4,
  },
  // 本番環境でのソースマップ無効化
  productionBrowserSourceMaps: false,
  turbopack: {},
};

// バンドル分析の設定
const analyzerConfig = {
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
};

const withPWA = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withBundleAnalyzer(analyzerConfig)(withPWA(nextConfig));
