import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/site/skip-link";
import { CustomCursor } from "@/components/site/custom-cursor";
import { BackToTop } from "@/components/site/back-to-top";
import { ShortcutsHelp } from "@/components/site/shortcuts-help";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "lejxz — Lejuene Delantar",
  description:
    "Portfolio of Lejuene Delantar (lejxz) — Computer Science student majoring in Artificial Intelligence.",
  authors: [{ name: "Lejuene Delantar" }],
  creator: "Lejuene Delantar",
  icons: {
    icon: "/assets/favicon.svg",
  },
  openGraph: {
    title: "lejxz — Lejuene Delantar",
    description:
      "Portfolio of Lejuene Delantar (lejxz) — Computer Science, Artificial Intelligence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "lejxz — Lejuene Delantar",
    description:
      "Portfolio of Lejuene Delantar (lejxz) — Computer Science, Artificial Intelligence.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SkipLink />
        <CustomCursor />
        <BackToTop />
        <ShortcutsHelp />
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
