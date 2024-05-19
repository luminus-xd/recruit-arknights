import type { Metadata, Viewport } from "next";
import { Inter, BIZ_UDGothic } from "next/font/google";
import "./globals.css";

import Footer from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  title: "Arknights Recruitment | アークナイツ公開求人ツール",
  description:
    "アークナイツの公開求人機能のタグ絞り込みをシミュレーションするアプリケーションです",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arknights Recruitment | アークナイツ公開求人ツール",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Arknights Recruitment | アークナイツ公開求人ツール",
    description:
      "アークナイツの公開求人機能のタグ絞り込みをシミュレーションするアプリケーションです",
    images: "/img/ogp.png",
  },
  twitter: {
    card: "summary",
    title: "Arknights Recruitment | アークナイツ公開求人ツール",
    images: "/img/ogp.png",
    creator: "@midnight_dev2",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/**
 * Google Fonts Inter
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
/**
 * Google Fonts Zen Kaku Gothic New
 */
const biz = BIZ_UDGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-biz",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`
          "min-h-screen ${inter.variable} ${biz.variable} bg-background font-sans font-japanese antialiased" inter.variable,ZenKakuGothicNew.variable`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
