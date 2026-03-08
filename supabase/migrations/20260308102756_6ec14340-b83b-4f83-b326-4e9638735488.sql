
CREATE TABLE public.user_face_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'primary',
  descriptors jsonb NOT NULL,
  scan_quality float NOT NULL DEFAULT 0,
  image_snapshot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, label)
);

ALTER TABLE public.user_face_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own face data"
  ON public.user_face_data FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own face data"
  ON public.user_face_data FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own face data"
  ON public.user_face_data FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own face data"
  ON public.user_face_data FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_face_data_updated_at
  BEFORE UPDATE ON public.user_face_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add face_scan_enabled to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS face_scan_enabled boolean NOT NULL DEFAULT false;
