"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Send, ArrowUpRight, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { profile } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ConfettiBurst } from "@/components/motion/confetti-burst";
import { ContactTicker } from "@/components/sections/home-ticker";
import { asset } from "@/lib/asset";

export function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Simple but practical email regex — not RFC-perfect, but catches the
  // common mistakes (missing @, missing TLD, spaces).
  const emailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailShowError = emailTouched && email !== "" && !emailValid;
  const charCount = message.length;
  const charLimit = 600;
  const charWarn = charCount > charLimit * 0.9;
  const sendProgress = Math.min(charCount / charLimit, 1);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a message first");
      return;
    }
    if (email && !emailValid) {
      toast.error("Please fix the email address or leave it blank");
      return;
    }
    // Compute the burst origin from the submit button's position.
    const btn = (e.target as HTMLFormElement).querySelector('button[type="submit"]');
    if (btn) {
      const r = btn.getBoundingClientRect();
      const formR = formRef.current?.getBoundingClientRect();
      setBurstOrigin({
        x: r.left + r.width / 2 - (formR?.left ?? 0),
        y: r.top + r.height / 2 - (formR?.top ?? 0),
      });
    }
    setConfettiTrigger((c) => c + 1);
    setSubmitted(true);
    // Clear the success banner after 4s.
    setTimeout(() => setSubmitted(false), 4000);

    const subject = encodeURIComponent(`Portfolio message from ${name || "a visitor"}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name || "Anonymous"}${email ? `\nReply-to: ${email}` : ""}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email client…");
  };

  const socials = [
    { label: "GitHub", icon: "github", url: profile.socials.github ?? "#" },
    { label: "LinkedIn", icon: "linkedin", url: profile.socials.linkedin ?? "#" },
    { label: "Instagram", icon: "instagram", url: profile.socials.instagram ?? "#" },
    { label: "Email", icon: "mail", url: profile.socials.email ?? `mailto:${profile.email}` },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      {/* Contact ticker — second marquee row, above the contact card */}
      <div className="mb-8">
        <ContactTicker />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="card-hover-glow relative overflow-hidden rounded-[2rem] border border-line bg-surface/75 backdrop-blur-sm p-6 sm:p-10 lg:p-14">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet/15 blur-[100px]" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: pitch + email + socials */}
            <div>
              <SectionHeading index="06" kicker="Get in touch" title="Contact" />
              <Reveal delay={0.08}>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-dim sm:text-lg">
                  {profile.availabilityNote ?? profile.availability}. {profile.contactNote ?? ""}
                </p>
              </Reveal>

              <Reveal delay={0.14}>
                <div className="group relative mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface/80 backdrop-blur-sm p-4 transition-colors hover:border-teal/30">
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex flex-1 items-center gap-4"
                    aria-label={`Email ${profile.email}`}
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
                  <CopyEmailButton email={profile.email} />
                </div>
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
                ref={formRef}
                onSubmit={onSubmit}
                className="relative flex flex-col gap-4 rounded-2xl border border-line bg-surface/70 backdrop-blur-sm p-5 sm:p-6"
              >
                {/* Confetti burst overlay — originates from the submit button */}
                <ConfettiBurst trigger={confettiTrigger} originX={burstOrigin.x} originY={burstOrigin.y} />
                {/* Success banner — shows for 4s after submit */}
                {submitted && (
                  <div className="flex items-center gap-2 rounded-xl border border-teal/40 bg-teal/10 px-4 py-2.5 font-mono text-xs text-teal">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Opening your email client — your message is ready to send!</span>
                  </div>
                )}
                <Field label="Your name" required>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-xl border border-line bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  />
                </Field>
                <Field
                  label="Reply-to (optional)"
                  error={emailShowError ? "Hmm, that doesn't look like an email" : undefined}
                  valid={email !== "" && emailValid}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="ada@example.com"
                    aria-invalid={emailShowError}
                    className={
                      "w-full rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-2 transition-colors " +
                      (emailShowError
                        ? "border-destructive/50 focus:border-destructive/60 focus:ring-destructive/20"
                        : email !== "" && emailValid
                        ? "border-teal/40 focus:border-teal/50 focus:ring-teal/20"
                        : "border-line focus:border-teal/40 focus:ring-teal/20")
                    }
                  />
                </Field>
                <Field label="Message" required>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={charLimit}
                    placeholder="Tell me about your project, role, or idea…"
                    className="w-full resize-none rounded-xl border border-line bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      "font-mono text-[10px] transition-colors " +
                      (charWarn ? "text-violet" : "text-dim")
                    }
                  >
                    {charCount}/{charLimit}
                    {charWarn && charCount < charLimit && " · almost full"}
                  </span>
                  {/* Send button with a character-count progress ring.
                      The ring fills as the message approaches the limit,
                      giving a visual sense of "readiness" at a glance. */}
                  <div className="relative inline-flex items-center">
                    <svg
                      className="pointer-events-none absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90"
                      viewBox="0 0 100 100"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="var(--color-line)"
                        strokeWidth="2"
                        fill="none"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke={charWarn ? "var(--color-violet)" : "var(--color-teal)"}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 46}
                        initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 46 * (1 - sendProgress),
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                          filter: charWarn
                            ? "drop-shadow(0 0 4px var(--color-violet))"
                            : "drop-shadow(0 0 4px var(--color-teal))",
                        }}
                      />
                    </svg>
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -1 }}
                      className="group relative inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 font-mono text-xs font-medium text-primary-foreground shadow-lg shadow-teal/20 transition-all hover:shadow-teal/40"
                    >
                      Send message
                      <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
                  </div>
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

function Field({
  label,
  children,
  error,
  valid,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  valid?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
        {label}
        {required && <span className="text-violet" aria-label="required">*</span>}
        {valid && (
          <span className="inline-flex items-center gap-1 text-teal normal-case tracking-normal">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1 5l2.5 2.5L9 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            looks good
          </span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-destructive">
          <span aria-hidden>⚠</span>
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * CopyEmailButton — a small icon button that copies the email address to the
 * clipboard. Shows a checkmark for 1.5s on success. Stops click propagation
 * so it doesn't trigger the parent mailto link.
 */
function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        toast.success("Email copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("Couldn't copy — try selecting manually");
      }
    },
    [email]
  );

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Email copied" : "Copy email address"}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface/60 text-dim transition-colors hover:border-teal/40 hover:text-teal"
    >
      {copied ? (
        <Check className="h-4 w-4 text-teal" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
