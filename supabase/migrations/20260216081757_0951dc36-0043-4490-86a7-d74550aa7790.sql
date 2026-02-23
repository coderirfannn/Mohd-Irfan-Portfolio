
-- Settings table (single row)
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mohd Irfan',
  title text NOT NULL DEFAULT 'Recruiter & Talent Acquisition Specialist',
  summary text DEFAULT '',
  location text DEFAULT '',
  email text DEFAULT '',
  whatsapp text DEFAULT '',
  github text DEFAULT '',
  linkedin text DEFAULT '',
  portfolio_seo_title text DEFAULT 'Mohd Irfan | Recruiter Portfolio',
  portfolio_seo_description text DEFAULT '',
  og_image_url text DEFAULT '',
  resume_url text DEFAULT '',
  availability_status text DEFAULT 'Open to work',
  hero_text text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (
  (SELECT auth.uid()) IS NOT NULL
);
CREATE POLICY "Admin can insert settings" ON public.settings FOR INSERT WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
);

-- Insert default settings row
INSERT INTO public.settings (name, title, summary, location, email, availability_status, hero_text)
VALUES (
  'Mohd Irfan',
  'Full-Stack Developer',
  'Passionate developer building modern web applications with React, TypeScript, and Supabase.',
  'India',
  'irfan@example.com',
  'Open to work',
  'I build things for the web.'
);

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  tagline text DEFAULT '',
  category text DEFAULT 'Web App',
  stack jsonb DEFAULT '[]'::jsonb,
  problem text DEFAULT '',
  solution text DEFAULT '',
  features jsonb DEFAULT '[]'::jsonb,
  challenges jsonb DEFAULT '[]'::jsonb,
  impact_metrics jsonb DEFAULT '{}'::jsonb,
  live_url text DEFAULT '',
  github_url text DEFAULT '',
  cover_image_url text DEFAULT '',
  gallery_images jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects" ON public.projects FOR SELECT USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can insert projects" ON public.projects FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update projects" ON public.projects FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete projects" ON public.projects FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Experience table
CREATE TABLE public.experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  company text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text DEFAULT '',
  is_published boolean DEFAULT true,
  order_index int DEFAULT 0
);

ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published experience" ON public.experience FOR SELECT USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can insert experience" ON public.experience FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update experience" ON public.experience FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete experience" ON public.experience FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Skills table
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  items jsonb DEFAULT '[]'::jsonb,
  order_index int DEFAULT 0
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin can insert skills" ON public.skills FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update skills" ON public.skills FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete skills" ON public.skills FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text DEFAULT '',
  message text NOT NULL,
  source text DEFAULT 'LinkedIn',
  is_published boolean DEFAULT true,
  order_index int DEFAULT 0
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published testimonials" ON public.testimonials FOR SELECT USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update testimonials" ON public.testimonials FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete testimonials" ON public.testimonials FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Contact messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'new' CHECK (status IN ('new', 'replied', 'archived'))
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read messages" ON public.contact_messages FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update messages" ON public.contact_messages FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete messages" ON public.contact_messages FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 3 projects
INSERT INTO public.projects (slug, title, tagline, category, stack, problem, solution, features, is_featured, is_published) VALUES
('javecorx', 'JAVECORX', 'AI-Powered Learning Management System', 'AI / EdTech', '["React", "TypeScript", "Node.js", "OpenAI", "PostgreSQL"]'::jsonb, 'Traditional LMS platforms lack personalization and intelligent content delivery.', 'Built an AI-powered LMS that adapts learning paths based on student performance and engagement patterns.', '["AI-driven content recommendations", "Real-time progress tracking", "Adaptive assessments", "Instructor analytics dashboard"]'::jsonb, true, true),
('chatlock', 'ChatLock', 'Secure Real-Time Chat Application', 'Mobile App', '["React Native", "Node.js", "Socket.io", "MongoDB", "JWT"]'::jsonb, 'Users need a secure, fast messaging platform with end-to-end encryption.', 'Developed a React Native chat app with Node.js backend featuring real-time messaging and robust security.', '["End-to-end encryption", "Real-time messaging", "Media sharing", "Group chats", "Push notifications"]'::jsonb, true, true),
('smart-helper', 'Smart Helper Auto-Assignment', 'Intelligent Task Matching System', 'Web App', '["Next.js", "Supabase", "TypeScript", "Tailwind CSS"]'::jsonb, 'Manual task assignment is slow and often mismatches skills to requirements.', 'Created an intelligent matching system that auto-assigns helpers based on skills, availability, and proximity.', '["Smart matching algorithm", "Real-time availability tracking", "Performance scoring", "Admin dashboard"]'::jsonb, true, true);

-- Seed skills
INSERT INTO public.skills (group_name, items, order_index) VALUES
('Frontend', '["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"]'::jsonb, 0),
('Backend', '["Node.js", "Express", "Python", "REST APIs", "GraphQL"]'::jsonb, 1),
('Database', '["PostgreSQL", "MongoDB", "Supabase", "Redis"]'::jsonb, 2),
('DevOps & Tools', '["Git", "Docker", "Vercel", "GitHub Actions", "Figma"]'::jsonb, 3);

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

CREATE POLICY "Public can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Admin can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update project images" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND (SELECT auth.uid()) IS NOT NULL);

-- Resume storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resume', 'resume', true);

CREATE POLICY "Public can view resume" ON storage.objects FOR SELECT USING (bucket_id = 'resume');
CREATE POLICY "Admin can upload resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume' AND (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can update resume" ON storage.objects FOR UPDATE USING (bucket_id = 'resume' AND (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Admin can delete resume" ON storage.objects FOR DELETE USING (bucket_id = 'resume' AND (SELECT auth.uid()) IS NOT NULL);
