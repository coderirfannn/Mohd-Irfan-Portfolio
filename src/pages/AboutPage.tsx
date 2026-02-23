import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("settings").select("*").limit(1).single().then(({ data }) => setSettings(data));
    supabase.from("experience").select("*").eq("is_published", true).order("order_index").then(({ data }) => setExperience(data || []));
    supabase.from("skills").select("*").order("order_index").then(({ data }) => setSkills(data || []));
    supabase.from("testimonials").select("*").eq("is_published", true).order("order_index").then(({ data }) => setTestimonials(data || []));
  }, []);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{settings?.name || "About"}</h1>
          {settings?.title && <p className="text-primary text-base font-medium mb-4">{settings.title}</p>}
          {settings?.summary && <p className="text-muted-foreground leading-relaxed mb-16 max-w-xl">{settings.summary}</p>}
        </motion.div>

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-16">
            <h2 className="text-lg font-semibold mb-6">Experience</h2>
            <div className="space-y-0 border-l border-border ml-2">
              {experience.map((exp) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="pl-6 pb-8 relative"
                >
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-border -translate-x-[5px]" />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                    <div>
                      <h3 className="font-medium text-sm">{exp.role}</h3>
                      <p className="text-primary text-xs">{exp.company}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {fmtDate(exp.start_date)} — {exp.end_date ? fmtDate(exp.end_date) : "Present"}
                    </span>
                  </div>
                  {exp.description && <p className="text-sm text-muted-foreground leading-relaxed mt-2">{exp.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-16">
            <h2 className="text-lg font-semibold mb-6">Skills</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {skills.map(sg => (
                <div key={sg.id}>
                  <h3 className="text-sm font-medium mb-3">{sg.group_name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(sg.items) ? sg.items : []).map((s: string) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-6">What people say</h2>
            <div className="space-y-4">
              {testimonials.map(t => (
                <motion.blockquote
                  key={t.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="border-l-2 border-border pl-5 py-2"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed italic mb-2">"{t.message}"</p>
                  <footer className="text-xs">
                    <span className="font-medium text-foreground">{t.name}</span>
                    {t.title && <span className="text-muted-foreground"> · {t.title}</span>}
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
