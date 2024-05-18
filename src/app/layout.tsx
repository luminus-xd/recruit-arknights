import type { Metadata, Viewport } from "next";
import { Inter, BIZ_UDGothic } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  title: "Arknights Recruit",
  description: "公開求人の絞り込みツール",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arknights Recruit",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Arknights Recruit",
    description: "公開求人の絞り込みツール",
    images: "/ogp-luminus.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arknights Recruit",
    images: "/ogp-luminus.png",
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
      </body>
    </html>
  );
}
