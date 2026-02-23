import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_id: string | null;
  skills: string[];
  image_url: string | null;
  verify_url: string | null;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("certificates")
      .select("*")
      .eq("is_published", true)
      .order("order_index")
      .then(({ data }) => {
        setCertificates(
          (data || []).map((c: any) => ({ ...c, skills: Array.isArray(c.skills) ? c.skills : [] }))
        );
        setLoading(false);
      });
  }, []);

  return (
    <>
      <section className="section-padding">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Certificates</h1>
            <p className="text-muted-foreground mb-12 max-w-lg">
              Professional certifications and verified credentials.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border h-64 animate-pulse bg-secondary/50" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">No certificates published yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  onClick={() => setSelected(cert)}
                  className="group rounded-lg border border-border overflow-hidden cursor-pointer hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="aspect-[16/10] bg-secondary overflow-hidden">
                    {cert.image_url ? (
                      <img src={cert.image_url} alt={cert.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-muted-foreground/15">{cert.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">{cert.issuer}</p>
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{cert.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Calendar size={11} />
                      {new Date(cert.issue_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                    {cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{s}</span>
                        ))}
                        {cert.skills.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">+{cert.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl border-border p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selected?.title ?? "Certificate details"}</DialogTitle>
          {selected && (
            <div>
              {selected.image_url && (
                <div className="aspect-video bg-secondary">
                  <img src={selected.image_url} alt={selected.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{selected.issuer}</p>
                  <h2 className="text-xl font-bold">{selected.title}</h2>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(selected.issue_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  {selected.credential_id && (
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} />
                      {selected.credential_id}
                    </span>
                  )}
                </div>
                {selected.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}
                {selected.verify_url && (
                  <a
                    href={selected.verify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Verify <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
