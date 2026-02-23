import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").limit(1).single().then(({ data }) => setForm(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const { id, updated_at, ...payload } = form;
    const { error } = await supabase.from("settings").update(payload).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  };

  if (!form) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const field = (label: string, key: string, textarea = false) => (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary resize-none" />
      ) : (
        <input value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary text-sm">Profile</h2>
          {field("Name", "name")}
          {field("Title", "title")}
          {field("Summary", "summary", true)}
          {field("Hero Text", "hero_text")}
          {field("Location", "location")}
          {field("Email", "email")}
          {field("WhatsApp", "whatsapp")}
          {field("Availability Status", "availability_status")}
        </div>
        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary text-sm">Links</h2>
          {field("GitHub", "github")}
          {field("LinkedIn", "linkedin")}
          {field("Resume URL", "resume_url")}
        </div>
        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary text-sm">SEO</h2>
          {field("SEO Title", "portfolio_seo_title")}
          {field("SEO Description", "portfolio_seo_description", true)}
          {field("OG Image URL", "og_image_url")}
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
