import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Mail, Archive, MessageSquare } from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setMessages(data || []));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    load();
    toast.success(`Marked as ${status}`);
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    load();
    toast.success("Deleted");
  };

  const filtered = statusFilter === "all" ? messages : messages.filter(m => m.status === statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="flex gap-2 mb-6">
        {["all", "new", "replied", "archived"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-sm px-3 py-1.5 rounded-full font-medium capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(msg => (
          <div key={msg.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{msg.name}</h3>
                <p className="text-sm text-muted-foreground">{msg.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${msg.status === "new" ? "bg-primary/10 text-primary" : msg.status === "replied" ? "bg-secondary text-muted-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {msg.status}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{msg.message}</p>
            <div className="flex gap-2">
              {msg.status !== "replied" && (
                <button onClick={() => updateStatus(msg.id, "replied")} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80"><Mail size={12} /> Mark Replied</button>
              )}
              {msg.status !== "archived" && (
                <button onClick={() => updateStatus(msg.id, "archived")} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80"><Archive size={12} /> Archive</button>
              )}
              <button onClick={() => deleteMsg(msg.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 hover:text-destructive"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No messages.</p>}
      </div>
    </div>
  );
}
