"use client";

import { useEffect } from "react";
import { projects, experience } from "@/lib/data";
import { useModals } from "@/lib/modals";

/**
 * Reads the URL hash for `#project=<id>` or `#experience=<id>` and opens the
 * matching detail modal. Supports deep-links shared from cards. Runs once on
 * mount and whenever the hash changes.
 */
export function DeepLinkHandler() {
  const { openProject, openExperience } = useModals();

  useEffect(() => {
    const handle = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;

      const [key, value] = hash.split("=");
      if (key === "project" && value) {
        const p = projects.projects.find((x) => x.id === value);
        if (p) {
          openProject(p, projects.projects);
          // strip the hash so it doesn't re-open on refresh
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      } else if (key === "experience" && value) {
        const e = experience.items.find((x) => x.id === value);
        if (e) {
          openExperience(e);
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    };

    // slight delay so the modal provider is ready
    const t = setTimeout(handle, 200);
    window.addEventListener("hashchange", handle);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", handle);
    };
  }, [openProject, openExperience]);

  return null;
}
