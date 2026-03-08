
-- Vault Cards table
CREATE TABLE public.vault_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type text NOT NULL DEFAULT 'credit',
  card_holder text NOT NULL,
  card_number text NOT NULL,
  expiry_date text,
  cvv text,
  issuer_bank text,
  card_brand text,
  color_theme text DEFAULT 'purple',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own cards" ON public.vault_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.vault_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.vault_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.vault_cards FOR DELETE USING (auth.uid() = user_id);

-- Vault Passwords table
CREATE TABLE public.vault_passwords (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name text NOT NULL,
  site_url text,
  username text NOT NULL,
  encrypted_password text NOT NULL,
  notes text,
  category text DEFAULT 'general',
  favicon_url text,
  last_used timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own passwords" ON public.vault_passwords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own passwords" ON public.vault_passwords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own passwords" ON public.vault_passwords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own passwords" ON public.vault_passwords FOR DELETE USING (auth.uid() = user_id);

-- Vault Notes table
CREATE TABLE public.vault_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  color text DEFAULT 'default',
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notes" ON public.vault_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.vault_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.vault_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.vault_notes FOR DELETE USING (auth.uid() = user_id);
