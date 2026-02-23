import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug!)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setProject(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-lg">Project not found.</p>
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  const stack: string[] = Array.isArray(project.stack) ? project.stack : [];
  const features: string[] = Array.isArray(project.features) ? project.features : [];
  const galleryImages: string[] = Array.isArray(project.gallery_images) ? project.gallery_images : [];

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </Link>

          <div>
            <span className="text-sm font-mono text-primary">{project.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">{project.title}</h1>
          {project.tagline && <p className="text-xl text-muted-foreground mb-8">{project.tagline}</p>}

          <div className="flex flex-wrap gap-3 mb-8">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                <Github size={14} /> Source Code
              </a>
            )}
          </div>

          {project.cover_image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-10 bg-secondary">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {stack.map((s) => (
                <span key={s} className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-12">
            {project.problem && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">The Problem</h2>
                <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
              </div>
            )}
            {project.solution && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">The Solution</h2>
                <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <img src={img} alt={`${project.title} screenshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
