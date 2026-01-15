import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const siteName = "宮城バドミントン練習会";
const siteDescription =
  "宮城県のバドミントン練習会にビジターとして参加できるプラットフォーム。初心者から上級者まで、気軽に練習会を探して参加しよう。";
const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://miyagi-badminton.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | ビジター募集プラットフォーム`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "バドミントン",
    "練習会",
    "宮城県",
    "仙台",
    "ビジター",
    "スポーツ",
    "サークル",
    "初心者",
    "中級者",
    "上級者",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} | ビジター募集プラットフォーム`,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ビジター募集プラットフォーム`,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "wlesdxtk5wnW7cucyJy-iUrbzqRnvJ0sz-XgcomDsFs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* Google tag (gtag.js) - 本番環境のみ */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-NK2HQ6YZ6C"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-NK2HQ6YZ6C');
              `}
            </Script>
          </>
        )}
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white/80 backdrop-blur-sm border-t border-border py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-muted text-sm">
            <p>&copy; 2026 宮城バドミントン練習会. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
