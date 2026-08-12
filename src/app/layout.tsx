import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import SiteHeader from "../components/SiteHeader";
import ThemeRuntime from "../components/ThemeRuntime";
import LanguageProvider from "../components/LanguageProvider";
import { Suspense } from "react";
import "./globals.css";

const latinSans = Geist({
  variable: "--font-latin-sans",
  weight: "variable",
  subsets: ["latin"],
});

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
  const fontVariables = `${latinSans.variable} ${gothicSans.variable} ${geistMono.variable}`;

  return (
    <html lang="ko" data-theme={defaultTheme} className={fontVariables}>
      <body className="antialiased">
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
