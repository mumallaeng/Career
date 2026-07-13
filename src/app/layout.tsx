import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";
import SiteHeader from "../components/SiteHeader";
import ThemeRuntime from "../components/ThemeRuntime";
import LanguageProvider from "../components/LanguageProvider";
import { Suspense } from "react";
import "./globals.css";

const gothicSans = Noto_Sans_KR({
  variable: "--font-gothic-sans",
  weight: "variable",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "김연우(Gim Yeonwoo)",
  description: "Welcome to my introduction page!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultTheme = process.env.NEXT_PUBLIC_THEME ?? "hero-grid";

  return (
    <html lang="ko" data-theme={defaultTheme}>
      <body
        className={`${gothicSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeRuntime defaultTheme={defaultTheme} />
        </Suspense>
        <LanguageProvider>
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
