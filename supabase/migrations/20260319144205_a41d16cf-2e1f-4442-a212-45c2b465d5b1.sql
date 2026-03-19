
-- Create vault_documents table
CREATE TABLE public.vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  document_number text DEFAULT NULL,
  issuer text DEFAULT NULL,
  issue_date text DEFAULT NULL,
  expiry_date text DEFAULT NULL,
  notes text DEFAULT NULL,
  category text NOT NULL DEFAULT 'government',
  image_front_url text DEFAULT NULL,
  image_back_url text DEFAULT NULL,
  color_theme text DEFAULT 'blue',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own documents" ON public.vault_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.vault_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.vault_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.vault_documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_vault_documents_updated_at BEFORE UPDATE ON public.vault_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for document images
INSERT INTO storage.buckets (id, name, public) VALUES ('document-images', 'document-images', false);

-- Storage RLS: users can manage their own folder
CREATE POLICY "Users can upload document images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'document-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own document images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'document-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own document images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'document-images' AND (storage.foldername(name))[1] = auth.uid()::text);
