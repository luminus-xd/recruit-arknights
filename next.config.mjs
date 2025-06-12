/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1週間
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24時間
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24時間
        },
      },
    },
    {
      urlPattern: /\/json\/.*\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'json-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 6 * 60 * 60, // 6時間に短縮
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24時間
        },
      },
    },
  ],
};

const nextConfig = {
  reactStrictMode: true,
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256],
  },
  // 静的アセットの圧縮
  compress: true,
  // 実験的な最適化機能
  experimental: {
    // optimizeCss: true, // crittersパッケージが必要なため無効化
    scrollRestoration: true,
  },
  onDemandEntries: {
    // サーバーサイドのページキャッシュの保持時間
    maxInactiveAge: 25 * 1000,
    // 同時にキャッシュするページ数
    pagesBufferLength: 4,
  },
  // 本番環境でのソースマップ無効化
  productionBrowserSourceMaps: false,
};

// バンドル分析の設定
const analyzerConfig = {
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
};

export default withBundleAnalyzer(analyzerConfig)(withPWA(pwaConfig)(nextConfig));