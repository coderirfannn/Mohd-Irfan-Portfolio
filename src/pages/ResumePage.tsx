import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ExternalLink, Download } from "lucide-react";

export default function ResumePage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("settings").select("resume_url,name").limit(1).single()
      .then(({ data }) => { setSettings(data); setLoading(false); });
  }, []);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6 md:px-8 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Resume</h1>
          <p className="text-muted-foreground mb-8">
            Download or view my resume for a full overview of qualifications and experience.
          </p>
          {loading ? (
            <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          ) : settings?.resume_url ? (
            <div className="flex flex-wrap gap-3">
              <a
                href={settings.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={14} /> View Resume
              </a>
              <a
                href={settings.resume_url}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                <Download size={14} /> Download
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Resume coming soon.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
