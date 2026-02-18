import type { MetadataRoute } from "next";

// new Date() はリクエストごとに異なる値になりキャッシュ不可のため固定日付を使用
const LAST_MODIFIED = new Date("2025-10-05");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://recruit-arknights.vercel.app",
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://recruit-arknights.vercel.app/recommend",
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
