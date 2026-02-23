import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProjectCard from "@/components/ProjectCard";

/* ──────────────────────────────────────────────────────────────
   Animations
────────────────────────────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

/* ──────────────────────────────────────────────────────────────
   Types (keep light, but no `any`)
────────────────────────────────────────────────────────────── */
type SettingsRow = {
  name?: string | null;
  title?: string | null;
  hero_text?: string | null;
  summary?: string | null;
  availability_status?: string | null;
};

type ProjectRow = {
  id: string;
  slug?: string | null;
  title?: string | null;
  tagline?: string | null;
  category?: string | null;
  stack?: unknown;
  is_featured?: boolean | null;
  cover_image_url?: string | null;
};

type SkillGroupRow = {
  id: string;
  group_name?: string | null;
  items?: unknown;
  order_index?: number | null;
};

/* ──────────────────────────────────────────────────────────────
   Counter (requestAnimationFrame — smoother + no interval drift)
────────────────────────────────────────────────────────────── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let raf = 0;
    const start = performance.now();
    const duration = 900; // ms

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      {count}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [skills, setSkills] = useState<SkillGroupRow[]>([]);
  const [projectCount, setProjectCount] = useState<number>(0);

  // Optional: track errors (don’t silently fail like a newbie app)
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);

      try {
        const [{ data: settingsData, error: settingsErr }, featured, countRes, skillRes] =
          await Promise.all([
            supabase.from("settings").select("*").limit(1).single(),
            supabase
              .from("projects")
              .select("*")
              .eq("is_published", true)
              .eq("is_featured", true)
              .order("created_at", { ascending: false })
              .limit(3),
            supabase
              .from("projects")
              .select("id", { count: "exact", head: true })
              .eq("is_published", true),
            supabase.from("skills").select("*").order("order_index"),
          ]);

        if (cancelled) return;

        if (settingsErr) throw settingsErr;
        setSettings((settingsData as SettingsRow) ?? null);

        if (featured.error) throw featured.error;
        setProjects((featured.data as ProjectRow[]) ?? []);

        if (countRes.error) throw countRes.error;
        setProjectCount(countRes.count ?? 0);

        if (skillRes.error) throw skillRes.error;
        setSkills((skillRes.data as SkillGroupRow[]) ?? []);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load homepage data.";
        setLoadError(msg);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(
    () => [
      { value: projectCount || 3, suffix: "+", label: "Projects" },
      { value: 3, suffix: "+", label: "Platforms" },
      { value: 5, suffix: "+", label: "Hackathons" },
      { value: 2, suffix: "+", label: "Yrs Experience" },
    ],
    [projectCount]
  );

  const heroName = settings?.name || "Mohd Irfan";
  const heroTitle = settings?.title || "Full-Stack Developer";
  const heroStatus = settings?.availability_status || "Available for work";
  const heroText =
    settings?.hero_text ||
    settings?.summary ||
    "Building production software that solves real problems.";

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative">
        {/* soft background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 right-[-6rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: Text */}
            <div className="max-w-2xl p-3 sm:p-6 rounded-lg">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {heroStatus}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-5"
              >
                {heroName}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-3 max-w-xl"
              >
                {heroTitle}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed mb-8 sm:mb-10 max-w-xl"
              >
                {heroText}
              </motion.p>

              {/* Load error (if any) */}
              {loadError && (
                <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {loadError}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
              >
                <Link
                  to="/projects"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  View Work <ArrowRight size={15} />
                </Link>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <Mail size={15} /> Get in Touch
                </Link>
              </motion.div>
            </div>

            {/* Right: Hero image */}
            <motion.div initial="hidden" animate="show" variants={fadeInScale} className="relative">
              <div className="relative mx-auto top-8 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[420px]">
                {/* glow behind card */}
                <div className="absolute -inset-4 sm:-inset-5 -z-10 rounded-3xl bg-gradient-to-tr from-primary/18 via-transparent to-transparent blur-2xl" />

                <div className="relative aspect-[4/5] sm:aspect-square rounded-full overflow-hidden border border-border shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent z-10 pointer-events-none" />

                  <img
                    src="https://res.cloudinary.com/dpifyaq7d/image/upload/v1771349685/Mohd_Irfan_bnez9n.jpg"
                    alt="Portrait of Mohd Irfan"
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>

                {/* subtle caption / credibility */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  {/* <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> */}
                  {/* Production-focused engineer */}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── METRICS ─── */}
      <section className="border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {metrics.map((m) => (
              <motion.div
                key={m.label}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="rounded-xl bg-card/40 border border-border/60 p-5 sm:p-6"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  <Counter value={m.value} suffix={m.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ─── */}
      {projects.length > 0 && (
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6 mb-8 sm:mb-12">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Selected Work
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Featured Projects
                </h2>
              </div>

              <Link
                to="/projects"
                className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md px-2 py-1"
              >
                All projects <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  slug={p.slug || ""}
                  title={p.title || ""}
                  tagline={p.tagline || ""}
                  category={p.category || ""}
                  stack={Array.isArray(p.stack) ? (p.stack as string[]) : []}
                  is_featured={Boolean(p.is_featured)}
                  cover_image_url={p.cover_image_url || undefined}
                />
              ))}
            </div>

            <div className="sm:hidden mt-8">
              <Link
                to="/projects"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md px-2 py-1 w-fit"
              >
                View all projects <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── APPROACH ─── */}
      <section className="py-14 sm:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 sm:mb-14">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Approach
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How I build software
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              A clear process from understanding the problem to shipping production-ready code with measurable results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                num: "01",
                title: "Understand",
                desc: "I start with the problem — not the tech. Research, user needs, and clear requirements come before any code.",
              },
              {
                num: "02",
                title: "Build",
                desc: "Clean architecture with React, Node.js, and modern tooling. Every decision optimized for maintainability and scale.",
              },
              {
                num: "03",
                title: "Ship",
                desc: "Production deployment with real users, measurable outcomes, and documented impact. Not just code — results.",
              },
            ].map((item) => (
              <motion.div
                key={item.num}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8"
              >
                <span className="text-xs font-mono text-muted-foreground">{item.num}</span>
                <h3 className="text-base sm:text-lg font-semibold mt-3 mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SKILLS ─── */}
      {skills.length > 0 && (
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10 sm:mb-14">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Stack</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Technologies I work with
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
              {skills.map((sg) => (
                <motion.div
                  key={sg.id}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="bg-card/40 border border-border/60 rounded-2xl p-6"
                >
                  <h3 className="text-sm font-medium text-foreground mb-4">{sg.group_name || "Skills"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(sg.items) ? (sg.items as string[]) : []).map((s) => (
                      <span
                        key={s}
                        className="text-xs px-3 py-1.5 rounded-md bg-secondary text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 sm:p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
          >
            <div className="max-w-md">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Let&apos;s work together
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Available for freelance projects and full-time roles. I&apos;d love to hear about what you&apos;re building.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                Start a conversation <ArrowRight size={15} />
              </Link>
              <Link
                to="/resume"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                View Resume
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}