import type { Metadata, Viewport } from "next";
import { Noto_Sans, Rasa } from "next/font/google";
import "./globals.css";

/**
 * Noto Sans as the web fallback for Hiragino Sans (the Sage design system font).
 * On macOS/iOS where Hiragino Sans is available, the system font takes priority
 * via the CSS font stack in tokens.css. Noto Sans covers all other platforms.
 */
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Rasa Light — used for space card titles in the Sage Component Kit space tile.
 * Provides the editorial, slightly literary feel of the Ghibli-inspired design.
 */
const rasa = Rasa({
  variable: "--font-rasa",
  subsets: ["latin"],
  weight: ["300"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreeTime — Find spaces to work and wait",
  description:
    "Find public and work-friendly spaces near you. Cafes, libraries, coworking day passes, parks, and more — filtered by wifi, outlets, seating, and other amenities.",
};

/**
 * Mobile is the primary viewport for FreeTime — iOS Safari and Android Chrome
 * both need an explicit viewport meta to render at device width instead of
 * defaulting to a 980px desktop layout. We allow zoom (no maximumScale=1) so
 * we don't break pinch-zoom for accessibility.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${rasa.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
