import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterPub, setFilterPub] = useState<string>("all");

  const load = () => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => setProjects(data || []));
  };
  useEffect(load, []);

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("projects").update({ is_published: !current }).eq("id", id);
    load();
    toast.success(current ? "Unpublished" : "Published");
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("projects").update({ is_featured: !current }).eq("id", id);
    load();
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
    toast.success("Project deleted");
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchPub = filterPub === "all" || (filterPub === "published" ? p.is_published : !p.is_published);
    return matchSearch && matchPub;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link to="/admin/projects/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Plus size={16} /> New Project</Link>
      </div>
      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <select value={filterPub} onChange={e => setFilterPub(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{p.title}</h3>
                {p.is_featured && <Star size={14} className="text-primary shrink-0" />}
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_published ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {p.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{p.tagline}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button onClick={() => toggleFeatured(p.id, p.is_featured)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary" title="Toggle featured"><Star size={14} /></button>
              <button onClick={() => togglePublish(p.id, p.is_published)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Toggle publish">{p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              <Link to={`/admin/projects/${p.id}/edit`} className="p-2 rounded-md hover:bg-secondary text-muted-foreground"><Edit size={14} /></Link>
              <button onClick={() => deleteProject(p.id)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No projects found.</p>}
      </div>
    </div>
  );
}
