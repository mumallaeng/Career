import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "../components/Navigation";
import ThemeRuntime from "../components/ThemeRuntime";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gim Yeonwoo | Career",
  description: "Public career page, resume, and work for Gim Yeonwoo.",
};

const preferenceBootstrapScript = `
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get('theme');
    const queryLang = params.get('lang');

    const storedTheme = window.localStorage.getItem('career-theme');
    const browserTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const theme = (queryTheme || storedTheme || browserTheme || 'light').trim();
    document.documentElement.dataset.theme = theme || 'light';

    const storedLang = window.localStorage.getItem('career-lang');
    const browserLang = [...(navigator.languages || []), navigator.language || '']
      .find(Boolean) || 'en';
    const normalizedBrowserLang = /^ko\\b/i.test(browserLang) ? 'ko' : 'en';
    const lang = (queryLang || storedLang || normalizedBrowserLang || 'en').trim();
    document.documentElement.lang = lang || 'en';
  } catch (error) {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme || 'light';
    document.documentElement.lang = document.documentElement.lang || 'en';
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultTheme = process.env.NEXT_PUBLIC_THEME ?? "light";

  return (
    <html lang="en" data-theme={defaultTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeRuntime defaultTheme={defaultTheme} />
        </Suspense>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
