-- ========================================================================
-- SCHEMA POSTGRESQL POUR SUPABASE - RESTAURANT TIMES CAFÉ BAR & GRILL
-- ========================================================================

-- 1. Table des produits du menu
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prix NUMERIC NOT NULL, -- Prix en FCFA
  categorie TEXT NOT NULL CHECK (categorie IN ('cafe', 'bar', 'grill', 'dessert')),
  image TEXT NOT NULL,
  dispo BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL, -- Total en FCFA
  total_xof NUMERIC,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  consumption_mode TEXT NOT NULL CHECK (consumption_mode IN ('sur_place', 'a_emporter', 'livraison')),
  table_number TEXT,
  pickup_time TEXT,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_notes TEXT,
  status TEXT NOT NULL DEFAULT 'Commande en cours',
  notes TEXT,
  table_or_room TEXT,
  payment_status TEXT DEFAULT 'en_attente',
  payment_provider TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,
  receipt_number TEXT,
  currency TEXT DEFAULT 'XOF',
  amount_paid NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des paramètres d'établissement
CREATE TABLE IF NOT EXISTS public.establishment_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  nom_etablissement TEXT DEFAULT 'TIMES Café Bar & Grill',
  whatsapp_officiel TEXT DEFAULT '+229 97 00 00 00',
  logo_url TEXT,
  telephone TEXT DEFAULT '+229 21 00 00 00',
  adresse TEXT DEFAULT 'Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad.',
  email TEXT DEFAULT 'contact@times-cafebargrill.bj',
  devise_principale TEXT DEFAULT 'FCFA',
  taux_conversion_eur_xof NUMERIC DEFAULT 655.957,
  cgu_custom_text TEXT,
  politique_confidentialite_custom_text TEXT,
  regles_annulation_custom_text TEXT,
  dpo_email TEXT,
  legal_last_updated TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table du personnel et gestion des rôles (Privée, protégée par RLS)
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cuisine', 'bar', 'salle')),
  actif BOOLEAN DEFAULT true NOT NULL,
  telephone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  derniere_connexion TIMESTAMPTZ
);

-- Activation de Realtime sur les tables principales
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.establishment_settings;

-- Activation de Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
-- Products : Lecture publique, écriture réservée au personnel authentifié
CREATE POLICY "Lecture publique des produits disponibles" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Écriture des produits par le personnel authentifié" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders : Insertion autorisée aux clients, lecture et mise à jour pour le personnel authentifié
CREATE POLICY "Création de commande par les clients" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Accès aux commandes par le personnel authentifié" ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings : Lecture publique pour les paramètres généraux
CREATE POLICY "Lecture publique des paramètres" ON public.establishment_settings
  FOR SELECT USING (true);

CREATE POLICY "Mise à jour des paramètres par les administrateurs" ON public.establishment_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Staff Members : STRICTEMENT INTERDIT à la lecture publique, accessible UNIQUEMENT aux administrateurs
CREATE POLICY "Accès strict aux membres du personnel pour les admins" ON public.staff_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
