"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { profile } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { asset } from "@/lib/asset";

export function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a message first");
      return;
    }
    const subject = encodeURIComponent(`Portfolio message from ${name || "a visitor"}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name || "Anonymous"}${email ? `\nReply-to: ${email}` : ""}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email client…");
  };

  const socials = profile.socialLinks ?? [
    { label: "GitHub", icon: "github", url: profile.socials.github ?? "#" },
    { label: "LinkedIn", icon: "linkedin", url: profile.socials.linkedin ?? "#" },
    { label: "Instagram", icon: "instagram", url: profile.socials.instagram ?? "#" },
    { label: "Email", icon: "mail", url: `mailto:${profile.email}` },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="card-hover-glow relative overflow-hidden rounded-[2rem] border border-line bg-surface/40 p-6 sm:p-10 lg:p-14">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet/15 blur-[100px]" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: pitch + email + socials */}
            <div>
              <SectionHeading index="06" kicker="Get in touch" title="Contact" />
              <Reveal delay={0.08}>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-dim sm:text-lg">
                  {profile.availabilityNote ?? profile.availability}. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua.
                </p>
              </Reveal>

              <Reveal delay={0.14}>
                <a
                  href={`mailto:${profile.email}`}
                  className="group mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface/50 p-4 transition-colors hover:border-teal/30"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-dim">
                      Email
                    </span>
                    <span className="block truncate font-mono text-sm font-medium text-foreground transition-colors group-hover:text-teal">
                      {profile.email}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal" />
                </a>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-5">
                  <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-dim">
                    Elsewhere
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3.5 py-2 font-mono text-xs text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:text-teal"
                      >
                        <Icon name={s.icon} className="h-3.5 w-3.5" />
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: mailto form */}
            <Reveal delay={0.16}>
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/30 p-5 sm:p-6"
              >
                <Field label="Your name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-xl border border-line bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  />
                </Field>
                <Field label="Reply-to (optional)">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@example.com"
                    className="w-full rounded-xl border border-line bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={600}
                    placeholder="Tell me about your project, role, or idea…"
                    className="w-full resize-none rounded-xl border border-line bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-dim">
                    {message.length}/600
                  </span>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 font-mono text-xs font-medium text-primary-foreground shadow-lg shadow-teal/20 transition-shadow hover:shadow-teal/30"
                  >
                    Send message
                    <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>
                <p className="font-mono text-[10px] text-dim/70">
                  Opens your email client — no data is stored.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-dim">
        {label}
      </span>
      {children}
    </label>
  );
}
