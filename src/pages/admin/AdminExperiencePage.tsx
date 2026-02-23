import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";

export default function AdminExperiencePage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ role: "", company: "", start_date: "", end_date: "", description: "", is_published: true, order_index: 0 });

  const load = () => supabase.from("experience").select("*").order("order_index").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ role: "", company: "", start_date: "", end_date: "", description: "", is_published: true, order_index: 0 }); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role || !form.company || !form.start_date) { toast.error("Fill required fields"); return; }
    const payload = { ...form, end_date: form.end_date || null };
    if (editing) {
      await supabase.from("experience").update(payload).eq("id", editing.id);
      toast.success("Updated");
    } else {
      await supabase.from("experience").insert(payload);
      toast.success("Added");
    }
    resetForm(); load();
  };

  const startEdit = (item: any) => {
    setEditing(item);
    setForm({ role: item.role, company: item.company, start_date: item.start_date, end_date: item.end_date || "", description: item.description || "", is_published: item.is_published, order_index: item.order_index });
  };

  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("experience").delete().eq("id", id); load(); toast.success("Deleted"); };
  const togglePub = async (id: string, cur: boolean) => { await supabase.from("experience").update({ is_published: !cur }).eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Experience</h1>
      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 mb-6 space-y-4 max-w-xl">
        <h2 className="font-semibold">{editing ? "Edit" : "Add"} Experience</h2>
        <input placeholder="Role *" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <input placeholder="Company *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" placeholder="Start" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
          <input type="date" placeholder="End" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary resize-none" />
        <input type="number" placeholder="Order" value={form.order_index} onChange={e => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="w-32 px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">{editing ? "Update" : "Add"}</button>
          {editing && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">Cancel</button>}
        </div>
      </form>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{item.role} <span className="text-primary text-sm">@ {item.company}</span></h3>
              <p className="text-xs text-muted-foreground">{item.start_date} — {item.end_date || "Present"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => togglePub(item.id, item.is_published)} className="p-2 hover:bg-secondary rounded-md text-muted-foreground">{item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-secondary rounded-md text-muted-foreground"><Edit size={14} /></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
