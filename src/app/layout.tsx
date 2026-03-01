import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provide";
import { Inter, BIZ_UDGothic } from "next/font/google";
import "./globals.css";

import dynamic from "next/dynamic";

import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";
import Navigation from "@/components/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const ScrollProgress = dynamic(() => import("@/components/magicui/scroll-progress").then(m => ({ default: m.ScrollProgress })));
const Analytics = dynamic(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const ScrollToTopButton = dynamic(() => import("@/components/scroll-to-top-button"));

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  title: "Arknights Recruitment | アークナイツ公開求人ツール",
  description:
    "アークナイツの公開求人機能をシミュレーションするWebツール 追加は実装日の16時に反映されます",
  icons: {
    apple: "/apple-touch-icon.png?v=20251005-2",
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
      "アークナイツの公開求人機能をシミュレーションするWebツール 追加は実装日の16時に反映されます",
    url: "/",
    siteName: "Arknights Recruitment",
    images: "/img/icon.png?v=20251005-2",
  },
  twitter: {
    card: "summary",
    title: "Arknights Recruitment | アークナイツ公開求人ツール",
    images: "/img/icon.png?v=20251005-2",
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
  fallback: ["system-ui", "sans-serif"]
});
/**
 * Google Fonts BIZ UDGothic
 */
const biz = BIZ_UDGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-biz",
  preload: false,
  fallback: ["Hiragino Sans", "Noto Sans JP", "system-ui", "Yu Gothic", "Meiryo", "sans-serif"],
  adjustFontFallback: false
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
        <NuqsAdapter>
          <ScrollProgress />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="container p-4 sm:p-6">
              <Navigation />
              {children}
            </div>
            <Footer />
            <ScrollToTopButton />
          </ThemeProvider>
          <Analytics />
        </NuqsAdapter>
      </body>
    </html>
  );
}
