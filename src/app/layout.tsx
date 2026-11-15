import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "減量・食事記録アプリ (Meal Tracker)",
  description: "減量・カロリー管理のための食事記録アプリ (Next.js App Router + Supabase)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
