
CREATE TABLE public.biometric_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL,
  public_key text NOT NULL,
  device_name text,
  authenticator_type text DEFAULT 'platform',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_id, credential_id)
);

ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own biometric credentials"
  ON public.biometric_credentials FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometric credentials"
  ON public.biometric_credentials FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own biometric credentials"
  ON public.biometric_credentials FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own biometric credentials"
  ON public.biometric_credentials FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS biometric_enabled boolean NOT NULL DEFAULT false;
