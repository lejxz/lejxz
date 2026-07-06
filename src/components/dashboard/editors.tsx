"use client";

import * as React from "react";
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  ToggleField,
  TagInput,
  ListEditor,
  SectionCard,
} from "@/components/dashboard/fields";

// ---------------------------------------------------------------------------
// Each editor receives `data` (the parsed JSON object) and `onChange` (called
// with a new object on every edit). The parent handles save/dirty tracking.
// ---------------------------------------------------------------------------

export type EditorProps<T> = {
  data: T;
  onChange: (next: T) => void;
};

// ===========================================================================
// PROFILE
// ===========================================================================

export function ProfileEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  const setSocial = (key: string, v: string) =>
    onChange({ ...data, socials: { ...data.socials, [key]: v } });

  return (
    <div className="space-y-4">
      <SectionCard title="Identity">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Name" value={data.name ?? ""} onChange={(v) => set({ name: v })} />
          <TextField label="Penname / Handle" value={data.penname ?? ""} onChange={(v) => set({ penname: v, alias: v })} />
          <TextField label="Role" value={data.role ?? ""} onChange={(v) => set({ role: v })} />
          <TextField label="Field" value={data.field ?? ""} onChange={(v) => set({ field: v })} />
          <TextField label="Location" value={data.location ?? ""} onChange={(v) => set({ location: v })} />
          <TextField label="Email" value={data.email ?? ""} onChange={(v) => set({ email: v })} />
        </div>
        <TextField label="Tagline" value={data.tagline ?? ""} onChange={(v) => set({ tagline: v })} />
        <TextAreaField label="Bio (one paragraph per line)" value={(data.bio ?? []).join("\n")} onChange={(v) => set({ bio: v.split("\n") })} rows={4} />
        <TextAreaField label="Quote" value={data.quote ?? ""} onChange={(v) => set({ quote: v })} rows={2} />
      </SectionCard>

      <SectionCard title="Availability">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Availability" value={data.availability ?? ""} onChange={(v) => set({ availability: v })} />
          <TextField label="Availability note" value={data.availabilityNote ?? ""} onChange={(v) => set({ availabilityNote: v })} />
        </div>
        <ToggleField label="Currently available" value={data.available ?? false} onChange={(v) => set({ available: v })} />
      </SectionCard>

      <SectionCard title="Socials">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="GitHub URL" value={data.socials?.github ?? ""} onChange={(v) => setSocial("github", v)} />
          <TextField label="LinkedIn URL" value={data.socials?.linkedin ?? ""} onChange={(v) => setSocial("linkedin", v)} />
          <TextField label="Instagram URL" value={data.socials?.instagram ?? ""} onChange={(v) => setSocial("instagram", v)} />
          <TextField label="Email URL" value={data.socials?.email ?? ""} onChange={(v) => setSocial("email", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Quick stats (hero chips)">
        <ListEditor
          items={data.stats ?? []}
          onChange={(stats) => set({ stats })}
          makeNew={() => ({ label: "New", value: "—" })}
          itemLabel={(s) => `${s.label}: ${s.value}`}
          addLabel="Add stat"
          renderItem={(item, up) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Label" value={item.label} onChange={(v) => up({ label: v })} />
              <TextField label="Value" value={item.value} onChange={(v) => up({ value: v })} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Numeric stats (count-up band)">
        <ListEditor
          items={data.numericStats ?? []}
          onChange={(numericStats) => set({ numericStats })}
          makeNew={() => ({ label: "New", value: 0, suffix: "" })}
          itemLabel={(s) => `${s.label}: ${s.value}${s.suffix ?? ""}`}
          addLabel="Add numeric stat"
          renderItem={(item, up) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TextField label="Label" value={item.label} onChange={(v) => up({ label: v })} />
              <NumberField label="Value" value={item.value} onChange={(v) => up({ value: v })} />
              <TextField label="Prefix" value={item.prefix ?? ""} onChange={(v) => up({ prefix: v })} />
              <TextField label="Suffix" value={item.suffix ?? ""} onChange={(v) => up({ suffix: v })} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}

// ===========================================================================
// MARQUEE
// ===========================================================================

export function MarqueeEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <SectionCard title="Ticker rows">
      <ListEditor
        items={data.rows ?? []}
        onChange={(rows) => set({ rows })}
        makeNew={() => ({ direction: "left", duration: 40, items: ["New"] })}
        itemLabel={(r) => `${r.direction} · ${r.duration}s · ${r.items?.length ?? 0} items`}
        addLabel="Add row"
        renderItem={(item, up) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Direction"
                value={item.direction}
                onChange={(v) => up({ direction: v })}
                options={[
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                ]}
              />
              <NumberField label="Duration (s)" value={item.duration} onChange={(v) => up({ duration: v })} min={5} max={120} />
            </div>
            <TagInput label="Items" values={item.items ?? []} onChange={(v) => up({ items: v })} />
          </div>
        )}
      />
    </SectionCard>
  );
}

// ===========================================================================
// SKILLS
// ===========================================================================

export function SkillsEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <SectionCard title="Heading">
        <TextField label="Heading" value={data.heading ?? ""} onChange={(v) => set({ heading: v })} />
        <TextAreaField label="Subtitle" value={data.subtitle ?? ""} onChange={(v) => set({ subtitle: v })} rows={2} />
        <TagInput label="Tech marquee" values={data.marquee ?? []} onChange={(v) => set({ marquee: v })} />
      </SectionCard>
      <SectionCard title="Skill groups">
        <ListEditor
          items={data.groups ?? []}
          onChange={(groups) => set({ groups })}
          makeNew={() => ({ title: "New group", key: "new", icon: "code", blurb: "", items: [] })}
          itemLabel={(g) => g.title}
          addLabel="Add group"
          renderItem={(item, up) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Title" value={item.title} onChange={(v) => up({ title: v })} />
                <TextField label="Key" value={item.key} onChange={(v) => up({ key: v })} />
              </div>
              <SelectField
                label="Icon"
                value={item.icon ?? "code"}
                onChange={(v) => up({ icon: v })}
                options={[
                  { value: "code", label: "Code" },
                  { value: "brain", label: "Brain" },
                  { value: "layout", label: "Layout" },
                  { value: "wrench", label: "Wrench" },
                  { value: "cpu", label: "CPU" },
                  { value: "sparkles", label: "Sparkles" },
                  { value: "network", label: "Network" },
                  { value: "database", label: "Database" },
                ]}
              />
              <TextAreaField label="Blurb" value={item.blurb ?? ""} onChange={(v) => up({ blurb: v })} rows={2} />
              <div className="rounded-lg border border-line p-2">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">Skills</p>
                <ListEditor
                  items={item.items ?? []}
                  onChange={(v) => up({ items: v })}
                  makeNew={() => ({ name: "New skill", level: 50, description: "" })}
                  itemLabel={(s) => `${s.name} · ${s.level}%`}
                  addLabel="Add skill"
                  renderItem={(skill, sup) => (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_80px] gap-2">
                        <TextField label="Name" value={skill.name} onChange={(v) => sup({ name: v })} />
                        <NumberField label="Level" value={skill.level} onChange={(v) => sup({ level: v })} min={0} max={100} />
                      </div>
                      <TextAreaField label="Description" value={skill.description ?? ""} onChange={(v) => sup({ description: v })} rows={2} />
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}

// ===========================================================================
// EXPERIENCE
// ===========================================================================

export function ExperienceEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <SectionCard title="Experience items">
      <ListEditor
        items={data.items ?? []}
        onChange={(items) => set({ items })}
        makeNew={() => ({
          id: `exp-${Date.now()}`,
          type: "work",
          role: "New role",
          org: "Org",
          organization: "Org",
          period: "2025 — Present",
          location: "Remote",
          current: false,
          summary: "",
          description: [],
          bullets: [],
          achievements: [],
          tech: [],
          tags: [],
        })}
        itemLabel={(e) => `${e.role} — ${e.org}`}
        addLabel="Add experience"
        renderItem={(item, up) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Role" value={item.role} onChange={(v) => up({ role: v })} />
              <TextField label="Organization" value={item.org} onChange={(v) => up({ org: v, organization: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Type"
                value={item.type ?? "work"}
                onChange={(v) => up({ type: v })}
                options={[
                  { value: "work", label: "Work" },
                  { value: "education", label: "Education" },
                  { value: "research", label: "Research" },
                  { value: "award", label: "Award" },
                ]}
              />
              <TextField label="Period" value={item.period} onChange={(v) => up({ period: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Location" value={item.location} onChange={(v) => up({ location: v })} />
              <TextField label="Logo path" value={item.logo ?? ""} onChange={(v) => up({ logo: v })} />
            </div>
            <TextField label="Org URL (optional)" value={item.orgUrl ?? ""} onChange={(v) => up({ orgUrl: v })} />
            <ToggleField label="Current" value={item.current ?? false} onChange={(v) => up({ current: v })} />
            <TextAreaField label="Summary" value={item.summary ?? ""} onChange={(v) => up({ summary: v })} rows={2} />
            <TextAreaField label="Description (one per line)" value={(item.description ?? []).join("\n")} onChange={(v) => up({ description: v.split("\n") })} rows={3} />
            <TextAreaField label="Achievements (one per line)" value={(item.achievements ?? item.bullets ?? []).join("\n")} onChange={(v) => up({ achievements: v.split("\n"), bullets: v.split("\n") })} rows={3} />
            <TagInput label="Tech" values={item.tech ?? []} onChange={(v) => up({ tech: v })} />
            <TagInput label="Tags" values={item.tags ?? []} onChange={(v) => up({ tags: v })} />
          </div>
        )}
      />
    </SectionCard>
  );
}

// ===========================================================================
// PROJECTS
// ===========================================================================

export function ProjectsEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <SectionCard title="Projects">
      <ListEditor
        items={data.projects ?? []}
        onChange={(projects) => set({ projects })}
        makeNew={() => ({
          id: `proj-${Date.now()}`,
          title: "New project",
          subtitle: "",
          category: "General",
          year: String(new Date().getFullYear()),
          status: "wip",
          summary: "",
          description: [],
          highlights: [],
          highlightList: [],
          role: "",
          duration: "",
          tech: [],
          tags: [],
          links: [],
          featured: false,
          accent: "teal",
          cover: "",
          thumbnail: "",
        })}
        itemLabel={(p) => `${p.title}${p.featured ? " ★" : ""}`}
        addLabel="Add project"
        renderItem={(item, up) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Title" value={item.title} onChange={(v) => up({ title: v })} />
              <TextField label="ID (slug)" value={item.id} onChange={(v) => up({ id: v })} />
            </div>
            <TextField label="Subtitle" value={item.subtitle ?? ""} onChange={(v) => up({ subtitle: v })} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Category" value={item.category} onChange={(v) => up({ category: v })} />
              <TextField label="Year" value={item.year} onChange={(v) => up({ year: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Status"
                value={item.status}
                onChange={(v) => up({ status: v })}
                options={[
                  { value: "shipped", label: "Shipped" },
                  { value: "wip", label: "Work in progress" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <SelectField
                label="Accent"
                value={item.accent ?? "teal"}
                onChange={(v) => up({ accent: v })}
                options={[
                  { value: "teal", label: "Teal" },
                  { value: "violet", label: "Violet" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Role" value={item.role ?? ""} onChange={(v) => up({ role: v })} />
              <TextField label="Duration" value={item.duration ?? ""} onChange={(v) => up({ duration: v })} />
            </div>
            <TextField label="Cover image path" value={item.cover ?? ""} onChange={(v) => up({ cover: v, thumbnail: v })} />
            <TextAreaField label="Summary" value={item.summary ?? ""} onChange={(v) => up({ summary: v })} rows={2} />
            <TextAreaField label="Description (one per line)" value={(item.description ?? []).join("\n")} onChange={(v) => up({ description: v.split("\n") })} rows={4} />
            <ToggleField label="Featured" value={item.featured ?? false} onChange={(v) => up({ featured: v })} />
            <TagInput label="Tech" values={item.tech ?? []} onChange={(v) => up({ tech: v })} />
            <TagInput label="Tags" values={item.tags ?? []} onChange={(v) => up({ tags: v })} />
            <div className="rounded-lg border border-line p-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">Highlights (metric cards)</p>
              <ListEditor
                items={item.highlights ?? []}
                onChange={(v) => up({ highlights: v })}
                makeNew={() => ({ label: "New", value: "—" })}
                itemLabel={(h) => `${h.label}: ${h.value}`}
                addLabel="Add highlight"
                renderItem={(h, hup) => (
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Label" value={h.label} onChange={(v) => hup({ label: v })} />
                    <TextField label="Value" value={h.value} onChange={(v) => hup({ value: v })} />
                  </div>
                )}
              />
            </div>
            <div className="rounded-lg border border-line p-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">Links</p>
              <ListEditor
                items={item.links ?? []}
                onChange={(v) => up({ links: v })}
                makeNew={() => ({ label: "Source", url: "https://" })}
                itemLabel={(l) => l.label}
                addLabel="Add link"
                renderItem={(l, lup) => (
                  <div className="grid grid-cols-[1fr_2fr] gap-3">
                    <TextField label="Label" value={l.label} onChange={(v) => lup({ label: v })} />
                    <TextField label="URL" value={l.url} onChange={(v) => lup({ url: v })} />
                  </div>
                )}
              />
            </div>
          </div>
        )}
      />
    </SectionCard>
  );
}

// ===========================================================================
// NOW
// ===========================================================================

export function NowEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <SectionCard title="Meta">
        <TextField label="Updated (YYYY-MM)" value={data.updated ?? ""} onChange={(v) => set({ updated: v })} />
      </SectionCard>
      <SectionCard title="Now items (About status widget)">
        <ListEditor
          items={data.items ?? []}
          onChange={(items) => set({ items })}
          makeNew={() => ({ label: "New", value: "", detail: "", icon: "sparkles" })}
          itemLabel={(n) => `${n.label}: ${n.value}`}
          addLabel="Add now item"
          renderItem={(item, up) => (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Label" value={item.label} onChange={(v) => up({ label: v })} />
                <SelectField
                  label="Icon"
                  value={item.icon ?? "sparkles"}
                  onChange={(v) => up({ icon: v })}
                  options={[
                    { value: "cpu", label: "CPU" },
                    { value: "book", label: "Book" },
                    { value: "sparkles", label: "Sparkles" },
                    { value: "graduation-cap", label: "Graduation" },
                    { value: "brain", label: "Brain" },
                    { value: "code", label: "Code" },
                  ]}
                />
              </div>
              <TextField label="Value" value={item.value} onChange={(v) => up({ value: v })} />
              <TextAreaField label="Detail" value={item.detail ?? ""} onChange={(v) => up({ detail: v })} rows={2} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}

// ===========================================================================
// FOOTER
// ===========================================================================

export function FooterEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <SectionCard title="Footer meta">
        <TextAreaField label="Note" value={data.note ?? ""} onChange={(v) => set({ note: v })} rows={2} />
        <TextField label="Built with" value={data.builtWith ?? ""} onChange={(v) => set({ builtWith: v })} />
        <TextField label="Copyright name" value={data.copyright ?? ""} onChange={(v) => set({ copyright: v })} />
      </SectionCard>
      <SectionCard title="Link columns">
        <ListEditor
          items={data.columns ?? []}
          onChange={(columns) => set({ columns })}
          makeNew={() => ({ title: "New", links: [] })}
          itemLabel={(c) => c.title}
          addLabel="Add column"
          renderItem={(col, up) => (
            <div className="space-y-2">
              <TextField label="Title" value={col.title} onChange={(v) => up({ title: v })} />
              <div className="rounded-lg border border-line p-2">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">Links</p>
                <ListEditor
                  items={col.links ?? []}
                  onChange={(v) => up({ links: v })}
                  makeNew={() => ({ label: "New", href: "/#" })}
                  itemLabel={(l) => l.label}
                  addLabel="Add link"
                  renderItem={(l, lup) => (
                    <div className="space-y-2">
                      <TextField label="Label" value={l.label} onChange={(v) => lup({ label: v })} />
                      <TextField label="Href" value={l.href} onChange={(v) => lup({ href: v })} />
                      <ToggleField label="External" value={l.external ?? false} onChange={(v) => lup({ external: v })} />
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}

// ===========================================================================
// SITE
// ===========================================================================

export function SiteEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <SectionCard title="Navigation">
        <ListEditor
          items={data.nav ?? []}
          onChange={(nav) => set({ nav })}
          makeNew={() => ({ label: "New", href: "/#" })}
          itemLabel={(n) => n.label}
          addLabel="Add nav item"
          renderItem={(n, up) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Label" value={n.label} onChange={(v) => up({ label: v })} />
              <TextField label="Href" value={n.href} onChange={(v) => up({ href: v })} />
            </div>
          )}
        />
      </SectionCard>
      <SectionCard title="Footer meta (site-level)">
        <TextAreaField label="Note" value={data.footer?.note ?? ""} onChange={(v) => set({ footer: { ...data.footer, note: v } })} rows={2} />
        <TextField label="Built with" value={data.footer?.builtWith ?? ""} onChange={(v) => set({ footer: { ...data.footer, builtWith: v } })} />
        <TextField label="Copyright" value={data.footer?.copyright ?? ""} onChange={(v) => set({ footer: { ...data.footer, copyright: v } })} />
      </SectionCard>
    </div>
  );
}

// ===========================================================================
// USES
// ===========================================================================

export function UsesEditor({ data, onChange }: EditorProps<any>) {
  const set = (patch: Record<string, any>) => onChange({ ...data, ...patch });
  return (
    <SectionCard title="Categories">
      <ListEditor
        items={data.categories ?? []}
        onChange={(categories) => set({ categories })}
        makeNew={() => ({ title: "New", key: "new", items: [] })}
        itemLabel={(c) => c.title}
        addLabel="Add category"
        renderItem={(cat, up) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Title" value={cat.title} onChange={(v) => up({ title: v })} />
              <TextField label="Key" value={cat.key} onChange={(v) => up({ key: v })} />
            </div>
            <div className="rounded-lg border border-line p-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">Items</p>
              <ListEditor
                items={cat.items ?? []}
                onChange={(v) => up({ items: v })}
                makeNew={() => ({ name: "New", detail: "" })}
                itemLabel={(i) => i.name}
                addLabel="Add item"
                renderItem={(item, iup) => (
                  <div className="space-y-2">
                    <TextField label="Name" value={item.name} onChange={(v) => iup({ name: v })} />
                    <TextAreaField label="Detail" value={item.detail ?? ""} onChange={(v) => iup({ detail: v })} rows={2} />
                  </div>
                )}
              />
            </div>
          </div>
        )}
      />
    </SectionCard>
  );
}
