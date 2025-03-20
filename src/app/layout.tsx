import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provide";
import { Inter, BIZ_UDGothic } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  title: "Arknights Recruitment | アークナイツ公開求人ツール",
  description:
    "アークナイツの公開求人機能のタグ絞り込みをシミュレーションするWebアプリ。最終タグ更新日時 2025年1月16日",
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
      "アークナイツの公開求人機能のタグ絞り込みをシミュレーションするWebアプリ。最終タグ更新日時 2025年1月16日",
    images: "/img/icon.png",
  },
  twitter: {
    card: "summary",
    title: "Arknights Recruitment | アークナイツ公開求人ツール",
    images: "/img/icon.png",
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
  preload: true,
});
/**
 * Google Fonts BIZ UDGothic
 */
const biz = BIZ_UDGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-biz",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="rcOOuqPq3L3ZCvMVn_xajAE0hxdH6pELLN4965CB_FM"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <JsonLd />
      </head>
      <body
        className={`min-h-screen ${inter.variable} ${biz.variable} bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
