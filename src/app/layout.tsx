import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "宮城バドミントン練習会 | ビジター募集プラットフォーム",
  description: "宮城県のバドミントン練習会にビジターとして参加できるプラットフォーム。気軽に練習会を探して参加しよう。",
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
      </head>
      <body className="min-h-screen flex flex-col antialiased">
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
