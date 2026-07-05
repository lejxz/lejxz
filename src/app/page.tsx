import Background from "@/components/three/background";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Background />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col">
        <Hero />
        <MarqueeBand />
        <About />
        <Skills />
        <Experience />
        <Work />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
