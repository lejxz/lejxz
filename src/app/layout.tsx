import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/site/skip-link";
import { CustomCursor } from "@/components/site/custom-cursor";
import { BackToTop } from "@/components/site/back-to-top";
import { ShortcutsHelp } from "@/components/site/shortcuts-help";
import { SectionProgress } from "@/components/site/section-progress";
import { RouteProgress } from "@/components/site/route-progress";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6f9" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Blocking inline script — runs before paint to apply the saved theme (or the
// OS preference on first visit). Without this the page would flash the wrong
// theme for a frame on every reload. The script is tiny and inlined so it
// doesn't block hydration.
//
// It reads `lejxz-theme` from localStorage. Valid values: "light" | "dark".
// On first visit (no saved value) it falls back to `prefers-color-scheme`.
// It also adds a `theme-anim` class *after* the first frame so the very
// first paint doesn't animate from nothing — only subsequent toggles do.
const themeInitScript = `
(function() {
  try {
    var key = 'lejxz-theme';
    var saved = localStorage.getItem(key);
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (prefersLight ? 'light' : 'dark');
    var root = document.documentElement;
    if (theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    // Defer the transition class until after first paint.
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { root.classList.add('theme-anim'); });
    });
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SkipLink />
        <CustomCursor />
        <BackToTop />
        <ShortcutsHelp />
        <SectionProgress />
        <RouteProgress />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
