import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Eye, EyeOff } from "lucide-react";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", title: "", message: "", source: "LinkedIn", is_published: true, order_index: 0 });

  const load = () => supabase.from("testimonials").select("*").order("order_index").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", title: "", message: "", source: "LinkedIn", is_published: true, order_index: 0 }); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) { toast.error("Name and message required"); return; }
    if (editing) {
      await supabase.from("testimonials").update(form).eq("id", editing.id);
      toast.success("Updated");
    } else {
      await supabase.from("testimonials").insert(form);
      toast.success("Added");
    }
    resetForm(); load();
  };

  const startEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, title: item.title || "", message: item.message, source: item.source, is_published: item.is_published, order_index: item.order_index });
  };

  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("testimonials").delete().eq("id", id); load(); toast.success("Deleted"); };
  const togglePub = async (id: string, cur: boolean) => { await supabase.from("testimonials").update({ is_published: !cur }).eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Testimonials</h1>
      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 mb-6 space-y-4 max-w-xl">
        <h2 className="font-semibold">{editing ? "Edit" : "Add"} Testimonial</h2>
        <input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <textarea placeholder="Message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary resize-none" />
        <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none">
          <option value="LinkedIn">LinkedIn</option>
          <option value="Email">Email</option>
          <option value="Client">Client</option>
        </select>
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
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-md">"{item.message}"</p>
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
