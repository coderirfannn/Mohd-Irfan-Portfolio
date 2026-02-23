import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

export default function AdminSkillsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ group_name: "", items: "", order_index: 0 });

  const load = () => supabase.from("skills").select("*").order("order_index").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ group_name: "", items: "", order_index: 0 }); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.group_name) { toast.error("Group name required"); return; }
    const payload = { group_name: form.group_name, items: form.items.split(",").map(s => s.trim()).filter(Boolean), order_index: form.order_index };
    if (editing) {
      await supabase.from("skills").update(payload).eq("id", editing.id);
      toast.success("Updated");
    } else {
      await supabase.from("skills").insert(payload);
      toast.success("Added");
    }
    resetForm(); load();
  };

  const startEdit = (item: any) => {
    setEditing(item);
    setForm({ group_name: item.group_name, items: (item.items as string[]).join(", "), order_index: item.order_index });
  };

  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("skills").delete().eq("id", id); load(); toast.success("Deleted"); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Skills</h1>
      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 mb-6 space-y-4 max-w-xl">
        <h2 className="font-semibold">{editing ? "Edit" : "Add"} Skill Group</h2>
        <input placeholder="Group name (e.g. Frontend)" value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
        <input placeholder="Skills (comma separated)" value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
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
              <h3 className="font-medium">{item.group_name}</h3>
              <p className="text-sm text-muted-foreground">{(item.items as string[]).join(", ")}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-secondary rounded-md text-muted-foreground"><Edit size={14} /></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
