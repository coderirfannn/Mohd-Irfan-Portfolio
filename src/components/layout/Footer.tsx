import { useEffect, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from("settings").select("name,github,linkedin,email").limit(1).single().then(({ data }) => setSettings(data));
  }, []);

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium mb-1">{settings?.name || "Mohd Irfan"}</p>
            <p className="text-xs text-muted-foreground">Building software that matters.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {settings?.github && (
                <a href={settings.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github size={16} />
                </a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin size={16} />
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
