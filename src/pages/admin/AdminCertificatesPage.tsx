import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Save, Award } from "lucide-react";

interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_id: string;
  skills: string[];
  image_url: string;
  verify_url: string;
  is_published: boolean;
  order_index: number;
}

const empty = (): Certificate => ({
  title: "",
  issuer: "",
  issue_date: new Date().toISOString().split("T")[0],
  credential_id: "",
  skills: [],
  image_url: "",
  verify_url: "",
  is_published: true,
  order_index: 0,
});

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("certificates")
      .select("*")
      .order("order_index")
      .then(({ data }) => {
        setCerts(
          (data || []).map((c: any) => ({
            ...c,
            skills: Array.isArray(c.skills) ? c.skills : [],
            credential_id: c.credential_id || "",
            image_url: c.image_url || "",
            verify_url: c.verify_url || "",
          }))
        );
        setLoading(false);
      });
  }, []);

  const addCert = () => setCerts([...certs, { ...empty(), order_index: certs.length }]);

  const update = (i: number, field: string, value: any) => {
    const updated = [...certs];
    (updated[i] as any)[field] = value;
    setCerts(updated);
  };

  const remove = async (i: number) => {
    const cert = certs[i];
    if (cert.id) {
      await supabase.from("certificates").delete().eq("id", cert.id);
    }
    setCerts(certs.filter((_, idx) => idx !== i));
    toast.success("Certificate removed");
  };

  const saveAll = async () => {
    setSaving(true);
    for (let i = 0; i < certs.length; i++) {
      const c = certs[i];
      const payload = {
        title: c.title,
        issuer: c.issuer,
        issue_date: c.issue_date,
        credential_id: c.credential_id || null,
        skills: c.skills,
        image_url: c.image_url || null,
        verify_url: c.verify_url || null,
        is_published: c.is_published,
        order_index: i,
      };
      if (c.id) {
        await supabase.from("certificates").update(payload).eq("id", c.id);
      } else {
        const { data } = await supabase.from("certificates").insert(payload).select().single();
        if (data) certs[i].id = data.id;
      }
    }
    setSaving(false);
    toast.success("Certificates saved");
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award size={24} /> Certificates
          </h1>
          <p className="text-sm text-muted-foreground">Manage your professional certifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addCert}>
            <Plus size={16} /> Add
          </Button>
          <Button onClick={saveAll} disabled={saving}>
            <Save size={16} /> {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <Award size={40} className="mx-auto mb-3 opacity-30" />
          <p>No certificates yet. Click "Add" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((c, i) => (
            <div key={c.id || i} className="border border-border rounded-xl p-5 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical size={16} />
                  <span className="text-sm font-medium">#{i + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`pub-${i}`} className="text-xs">Published</Label>
                    <Switch
                      id={`pub-${i}`}
                      checked={c.is_published}
                      onCheckedChange={(v) => update(i, "is_published", v)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Title *</Label>
                  <Input value={c.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Certificate title" />
                </div>
                <div>
                  <Label className="text-xs">Issuer *</Label>
                  <Input value={c.issuer} onChange={(e) => update(i, "issuer", e.target.value)} placeholder="e.g., Google, AWS" />
                </div>
                <div>
                  <Label className="text-xs">Issue Date *</Label>
                  <Input type="date" value={c.issue_date} onChange={(e) => update(i, "issue_date", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Credential ID</Label>
                  <Input value={c.credential_id} onChange={(e) => update(i, "credential_id", e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <Label className="text-xs">Image URL</Label>
                  <Input value={c.image_url} onChange={(e) => update(i, "image_url", e.target.value)} placeholder="Certificate image URL" />
                </div>
                <div>
                  <Label className="text-xs">Verify URL</Label>
                  <Input value={c.verify_url} onChange={(e) => update(i, "verify_url", e.target.value)} placeholder="Verification link" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Skills (comma-separated)</Label>
                  <Input
                    value={c.skills.join(", ")}
                    onChange={(e) => update(i, "skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="React, TypeScript, AWS"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
