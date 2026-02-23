import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);

    const { error } = await supabase.from("contact_messages").insert({ name: form.name, email: form.email, message: form.message });
    setSending(false);
    if (error) {
      toast.error("Failed to send. Please try again.");
    } else {
      toast.success("Message sent! I'll respond soon.");
      setForm({ name: "", email: "", message: "", honeypot: "" });
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none transition-colors text-sm";

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6 md:px-8 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Get in touch</h1>
          <p className="text-muted-foreground mb-10">Have something in mind? I'd love to hear about it.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" className="hidden" tabIndex={-1} value={form.honeypot} onChange={e => setForm({ ...form, honeypot: e.target.value })} />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your name" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} className={`${inputClass} resize-none`} placeholder="Tell me about your project..." />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? "Sending..." : <>Send message <ArrowRight size={14} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
