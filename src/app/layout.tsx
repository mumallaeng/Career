import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "../components/Navigation";
import ThemeRuntime from "../components/ThemeRuntime";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRuntime defaultTheme={defaultTheme} />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
