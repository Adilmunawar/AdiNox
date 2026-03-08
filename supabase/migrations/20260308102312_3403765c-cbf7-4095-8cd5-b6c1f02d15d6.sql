
-- Add updated_at column to biometric_credentials
ALTER TABLE public.biometric_credentials 
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Attach the existing updated_at trigger
CREATE TRIGGER update_biometric_credentials_updated_at
  BEFORE UPDATE ON public.biometric_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Verify handle_new_user still works - biometric_enabled has DEFAULT false so no changes needed
