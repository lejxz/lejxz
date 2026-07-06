import Background from "@/components/three/background";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { SideRail } from "@/components/site/side-rail";
import { BootOverlay } from "@/components/site/boot-overlay";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { DeepLinkHandler } from "@/components/site/deep-link-handler";
import { ModalsProvider } from "@/lib/modals";
import { SkewDivider } from "@/components/motion/skew-divider";
import { Hero } from "@/components/sections/hero";
import { HomeTicker } from "@/components/sections/home-ticker";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Uses } from "@/components/sections/uses";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <GrainOverlay />
      <BootOverlay />
      <Background />
      <Navbar />
      <ModalsProvider>
        <CommandPalette />
        <DeepLinkHandler />
        <SideRail />
        <main className="relative z-10 flex min-h-screen flex-col">
          <Hero />
          <HomeTicker />
          <About />
          <SkewDivider />
          <Skills />
          <SkewDivider flip />
          <Experience />
          <SkewDivider />
          <Work />
          <SkewDivider flip />
          <Uses />
          <SkewDivider />
          <Contact />
          <Footer />
        </main>
      </ModalsProvider>
    </>
  );
}
