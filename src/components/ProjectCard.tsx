import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  stack: string[];
  is_featured: boolean;
  cover_image_url?: string;
}

export default function ProjectCard({
  slug,
  title,
  tagline,
  category,
  stack,
  cover_image_url,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/projects/${slug}`}
        className="group block rounded-lg border border-border overflow-hidden hover:border-muted-foreground/30 transition-colors duration-200"
      >
        <div className="aspect-video bg-secondary relative overflow-hidden">
          {cover_image_url ? (
            <img
              src={cover_image_url}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/20">{title[0]}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {category}
            </span>
            <ArrowUpRight
              size={14}
              className="text-muted-foreground/40 group-hover:text-foreground transition-colors"
            />
          </div>
          <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tagline}</p>
          <div className="flex flex-wrap gap-1.5">
            {(stack as string[]).slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {stack.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                +{stack.length - 4}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
