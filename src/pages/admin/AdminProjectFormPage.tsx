import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  tagline: z.string().max(300).optional(),
  category: z.string().max(100).optional(),
  problem: z.string().max(5000).optional(),
  solution: z.string().max(5000).optional(),
  live_url: z.string().url().or(z.literal("")).optional(),
  github_url: z.string().url().or(z.literal("")).optional(),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminProjectFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", slug: "", tagline: "", category: "Web App", stack: "" as string,
    problem: "", solution: "", features: "", live_url: "", github_url: "",
    is_featured: false, is_published: false,
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("projects").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title, slug: data.slug, tagline: data.tagline || "", category: data.category || "",
            stack: (data.stack as string[])?.join(", ") || "",
            problem: data.problem || "", solution: data.solution || "",
            features: (data.features as string[])?.join("\n") || "",
            live_url: data.live_url || "", github_url: data.github_url || "",
            is_featured: data.is_featured, is_published: data.is_published,
          });
          setCoverImageUrl(data.cover_image_url || "");
        }
      });
    }
  }, [id, isEdit]);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: isEdit ? f.slug : slugify(title) }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${slugify(form.title || "project")}.${ext}`;
    const filePath = `covers/${fileName}`;

    const { error } = await supabase.storage.from("project-images").upload(filePath, file, { upsert: true });
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(filePath);
    setCoverImageUrl(urlData.publicUrl);
    toast.success("Cover image uploaded");
    setUploading(false);
  };

  const removeCoverImage = () => {
    setCoverImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = projectSchema.safeParse(form);
    if (!val.success) { toast.error(val.error.issues[0].message); return; }

    setSaving(true);
    const payload = {
      title: form.title, slug: form.slug || slugify(form.title), tagline: form.tagline, category: form.category,
      stack: form.stack.split(",").map(s => s.trim()).filter(Boolean),
      problem: form.problem, solution: form.solution,
      features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
      live_url: form.live_url, github_url: form.github_url,
      is_featured: form.is_featured, is_published: form.is_published,
      cover_image_url: coverImageUrl || "",
    };

    if (isEdit) {
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) toast.error(error.message); else { toast.success("Updated"); navigate("/admin/projects"); }
    } else {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) toast.error(error.message); else { toast.success("Created"); navigate("/admin/projects"); }
    }
    setSaving(false);
  };

  const field = (label: string, key: keyof typeof form, type = "text", textarea = false) => (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea value={form[key] as string} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={4} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary resize-none" />
      ) : (
        <input type={type} value={form[key] as string} onChange={e => key === "title" ? handleTitleChange(e.target.value) : setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary" />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Edit Project" : "New Project"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {field("Title", "title")}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Slug</label>
          <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary font-mono" />
        </div>
        {field("Tagline", "tagline")}
        {/* Cover Image Upload */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Cover Image</label>
          {coverImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={coverImageUrl} alt="Cover preview" className="w-full h-48 object-cover" />
              <button type="button" onClick={removeCoverImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:opacity-90">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {uploading ? (
                <span className="text-sm">Uploading...</span>
              ) : (
                <>
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Click to upload cover image</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                </>
              )}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm outline-none">
            {["Web App", "Mobile App", "AI / EdTech", "SaaS", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {field("Stack (comma separated)", "stack")}
        {field("Problem", "problem", "text", true)}
        {field("Solution", "solution", "text", true)}
        {field("Features (one per line)", "features", "text", true)}
        {field("Live URL", "live_url", "url")}
        {field("GitHub URL", "github_url", "url")}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="rounded" /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" /> Published</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={() => navigate("/admin/projects")} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
