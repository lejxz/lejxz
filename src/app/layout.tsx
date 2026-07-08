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
import { CursorTrail } from "@/components/motion/cursor-trail";
import { BootOverlay } from "@/components/site/boot-overlay";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { BASE_PATH } from "@/lib/asset";

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
    icon: `${BASE_PATH}/assets/favicon.svg`,
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

// Blocking inline script — runs before paint to apply the saved accent
// color. The site is always dark; the user picks an accent color.
// Valid values: "amber" (default), "teal", "violet", "emerald", "rose", "cyan".
const themeInitScript = `
(function() {
  try {
    var key = 'lejxz-accent';
    var saved = localStorage.getItem(key);
    var validAccents = ['teal', 'violet', 'emerald', 'amber', 'rose', 'cyan'];
    var accent = validAccents.indexOf(saved) >= 0 ? saved : 'amber';
    var root = document.documentElement;
    // Remove any existing accent classes.
    validAccents.forEach(function(a) { root.classList.remove('accent-' + a); });
    // Add the saved accent (amber is default — no class needed).
    if (accent !== 'amber') root.classList.add('accent-' + accent);
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
        <SmoothScroll>
          <BootOverlay />
          <SkipLink />
          <CustomCursor />
          <CursorTrail />
          <BackToTop />
          <ShortcutsHelp />
          <SectionProgress />
          <RouteProgress />
          {children}
          <Toaster position="bottom-right" />
        </SmoothScroll>
      </body>
    </html>
  );
}
