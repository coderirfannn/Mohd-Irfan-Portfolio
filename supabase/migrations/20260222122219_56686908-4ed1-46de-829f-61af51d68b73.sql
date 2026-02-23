
-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  credential_id TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  verify_url TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public can read published certificates
CREATE POLICY "Public can read published certificates"
ON public.certificates FOR SELECT
USING ((is_published = true) OR (( SELECT auth.uid() AS uid) IS NOT NULL));

-- Admin can insert
CREATE POLICY "Admin can insert certificates"
ON public.certificates FOR INSERT
WITH CHECK (( SELECT auth.uid() AS uid) IS NOT NULL);

-- Admin can update
CREATE POLICY "Admin can update certificates"
ON public.certificates FOR UPDATE
USING (( SELECT auth.uid() AS uid) IS NOT NULL);

-- Admin can delete
CREATE POLICY "Admin can delete certificates"
ON public.certificates FOR DELETE
USING (( SELECT auth.uid() AS uid) IS NOT NULL);
