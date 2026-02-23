import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, MessageSquare, Briefcase, Eye } from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ projects: 0, messages: 0, experience: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("experience").select("id", { count: "exact", head: true }),
    ]).then(([p, m, e]) => {
      setCounts({ projects: p.count || 0, messages: m.count || 0, experience: e.count || 0 });
    });
  }, []);

  const stats = [
    { label: "Projects", value: counts.projects, icon: FolderOpen },
    { label: "New Messages", value: counts.messages, icon: MessageSquare },
    { label: "Experience", value: counts.experience, icon: Briefcase },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} className="text-primary" />
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-6">
        <h2 className="font-semibold mb-2">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><Eye size={14} /> View Site</a>
        </div>
      </div>
    </div>
  );
}
