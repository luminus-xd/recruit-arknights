/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig = {
  reactStrictMode: true,
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withPWA(pwaConfig)(nextConfig));