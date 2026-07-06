import Background from "@/components/three/background";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ModalsProvider } from "@/lib/modals";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { ProjectsFull } from "@/components/views/projects-view";

export default function ProjectsPage() {
  return (
    <>
      <GrainOverlay />
      <Background />
      <Navbar />
      <ModalsProvider>
        <main className="relative z-10 flex min-h-screen flex-col">
          <ProjectsFull />
          <Footer />
        </main>
      </ModalsProvider>
    </>
  );
}
