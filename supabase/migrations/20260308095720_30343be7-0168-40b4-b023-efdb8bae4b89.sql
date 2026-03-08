
-- Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enable RLS on health_check (pre-existing issue)
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read health_check"
  ON public.health_check FOR SELECT
  TO authenticated
  USING (true);
