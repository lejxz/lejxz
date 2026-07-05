"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Project, ExperienceItem } from "@/lib/types";
import { ProjectModal } from "@/components/modals/project-modal";
import { ExperienceModal } from "@/components/modals/experience-modal";

type ModalKind = "project" | "experience" | null;

interface ModalsContextValue {
  project: Project | null;
  experience: ExperienceItem | null;
  kind: ModalKind;
  projectList: Project[];
  openProject: (project: Project, list?: Project[]) => void;
  openExperience: (experience: ExperienceItem) => void;
  close: () => void;
}

const ModalsContext = createContext<ModalsContextValue | null>(null);

export function ModalsProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [experience, setExperience] = useState<ExperienceItem | null>(null);
  const [kind, setKind] = useState<ModalKind>(null);

  const openProject = useCallback((p: Project, list?: Project[]) => {
    setProject(p);
    if (list && list.length) setProjectList(list);
    setExperience(null);
    setKind("project");
  }, []);

  const openExperience = useCallback((e: ExperienceItem) => {
    setExperience(e);
    setProject(null);
    setKind("experience");
  }, []);

  const close = useCallback(() => setKind(null), []);

  const nextProject = useCallback(() => {
    setProject((cur) => {
      if (!cur || projectList.length === 0) return cur;
      const idx = projectList.findIndex((p) => p.id === cur.id);
      if (idx === -1) return cur;
      return projectList[(idx + 1) % projectList.length];
    });
  }, [projectList]);

  const prevProject = useCallback(() => {
    setProject((cur) => {
      if (!cur || projectList.length === 0) return cur;
      const idx = projectList.findIndex((p) => p.id === cur.id);
      if (idx === -1) return cur;
      return projectList[(idx - 1 + projectList.length) % projectList.length];
    });
  }, [projectList]);

  const value = useMemo<ModalsContextValue>(
    () => ({
      project,
      experience,
      kind,
      projectList,
      openProject,
      openExperience,
      close,
    }),
    [project, experience, kind, projectList, openProject, openExperience, close]
  );

  return (
    <ModalsContext.Provider value={value}>
      {children}
      <ProjectModal
        project={project}
        open={kind === "project"}
        onClose={close}
        onNext={projectList.length > 1 ? nextProject : undefined}
        onPrev={projectList.length > 1 ? prevProject : undefined}
        hasMultiple={projectList.length > 1}
      />
      <ExperienceModal
        experience={experience}
        open={kind === "experience"}
        onClose={close}
      />
    </ModalsContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error("useModals must be used within ModalsProvider");
  return ctx;
}
