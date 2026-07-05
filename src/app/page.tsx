import Background from "@/components/three/background";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { SideRail } from "@/components/site/side-rail";
import { BootOverlay } from "@/components/site/boot-overlay";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { SkewDivider } from "@/components/motion/skew-divider";
import { Hero } from "@/components/sections/hero";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Uses } from "@/components/sections/uses";
import { Work } from "@/components/sections/work";
import { NowSection } from "@/components/sections/now-section";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <GrainOverlay />
      <BootOverlay />
      <Background />
      <Navbar />
      <CommandPalette />
      <SideRail />
      <main className="relative z-10 flex min-h-screen flex-col">
        <Hero />
        <MarqueeBand />
        <About />
        <SkewDivider />
        <Skills />
        <SkewDivider flip />
        <Experience />
        <SkewDivider />
        <Uses />
        <SkewDivider flip />
        <Work />
        <NowSection />
        <SkewDivider />
        <Testimonials />
        <SkewDivider flip />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
