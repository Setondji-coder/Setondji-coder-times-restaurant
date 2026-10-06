-- ========================================================================
-- SCHEMA POSTGRESQL POUR SUPABASE - RESTAURANT TIMES CAFÉ BAR & GRILL
-- ========================================================================

-- 1. Table des produits du menu (Structure officielle Supabase + compatibilité ascendante)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL, -- Prix en FCFA
  image_url TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag TEXT,
  
  -- Colonnes de rétrocompatibilité pour requêtes existantes
  nom TEXT,
  prix NUMERIC,
  categorie TEXT,
  image TEXT,
  dispo BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration automatique non destructive si la table existe déjà dans Supabase
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tag TEXT;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS nom TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS prix NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS categorie TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dispo BOOLEAN DEFAULT true;

-- Assouplissement des contraintes et harmonisation des types (conversion explicite vers TEXT)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_categorie_check;

DO $$
BEGIN
  -- Convertit category_id et categorie en TEXT au cas où l'un d'eux était créé en UUID dans Supabase
  BEGIN
    ALTER TABLE public.products ALTER COLUMN category_id TYPE TEXT USING category_id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.products ALTER COLUMN categorie TYPE TEXT USING categorie::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Synchronisation immédiate des colonnes avec cast explicite pour éviter l'erreur 42804 (UUID vs TEXT)
UPDATE public.products SET
  name = COALESCE(name::text, nom::text),
  nom = COALESCE(nom::text, name::text),
  price = COALESCE(price, prix),
  prix = COALESCE(prix, price),
  category_id = COALESCE(category_id::text, categorie::text),
  categorie = COALESCE(categorie::text, category_id::text),
  image_url = COALESCE(image_url::text, image::text),
  image = COALESCE(image::text, image_url::text),
  is_available = COALESCE(is_available, dispo, true),
  dispo = COALESCE(dispo, is_available, true),
  options = COALESCE(options, '[]'::jsonb);

-- Trigger bi-directionnel de synchronisation automatique (name <-> nom, price <-> prix, etc.)
CREATE OR REPLACE FUNCTION public.sync_product_fields_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NOT NULL AND NEW.nom IS NULL THEN
    NEW.nom := NEW.name::text;
  ELSIF NEW.nom IS NOT NULL AND NEW.name IS NULL THEN
    NEW.name := NEW.nom::text;
  END IF;

  IF NEW.price IS NOT NULL AND NEW.prix IS NULL THEN
    NEW.prix := NEW.price;
  ELSIF NEW.prix IS NOT NULL AND NEW.price IS NULL THEN
    NEW.price := NEW.prix;
  END IF;

  IF NEW.category_id IS NOT NULL AND NEW.categorie IS NULL THEN
    NEW.categorie := NEW.category_id::text;
  ELSIF NEW.categorie IS NOT NULL AND NEW.category_id IS NULL THEN
    NEW.category_id := NEW.categorie::text;
  END IF;

  IF NEW.image_url IS NOT NULL AND NEW.image IS NULL THEN
    NEW.image := NEW.image_url::text;
  ELSIF NEW.image IS NOT NULL AND NEW.image_url IS NULL THEN
    NEW.image_url := NEW.image::text;
  END IF;

  IF NEW.is_available IS NOT NULL AND NEW.dispo IS NULL THEN
    NEW.dispo := NEW.is_available;
  ELSIF NEW.dispo IS NOT NULL AND NEW.is_available IS NULL THEN
    NEW.is_available := NEW.dispo;
  END IF;

  IF NEW.options IS NULL THEN
    NEW.options := '[]'::jsonb;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_product_fields ON public.products;
CREATE TRIGGER trg_sync_product_fields
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_product_fields_trigger();

-- Index uniques pour garantir l'unicité et les performances
CREATE UNIQUE INDEX IF NOT EXISTS products_nom_idx ON public.products (nom);
CREATE INDEX IF NOT EXISTS products_name_idx ON public.products (name);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);

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
  whatsapp_officiel TEXT DEFAULT '+229 01 69 69 86 86',
  logo_url TEXT,
  telephone TEXT DEFAULT '+229 01 69 69 86 86 / +229 01 91 49 33 33',
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

-- Migration automatique si la table orders existe déjà
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_xof NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS consumption_mode TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_time TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Commande en cours';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_or_room TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'en_attente';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XOF';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;

-- Activation sécurisée de Realtime sur les tables principales (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.establishment_settings;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Activation de Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS) idempotentes
DROP POLICY IF EXISTS "Lecture publique des produits disponibles" ON public.products;
CREATE POLICY "Lecture publique des produits disponibles" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Écriture des produits par le personnel authentifié" ON public.products;
CREATE POLICY "Écriture des produits par le personnel authentifié" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Création de commande par les clients" ON public.orders;
CREATE POLICY "Création de commande par les clients" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Accès aux commandes par le personnel authentifié" ON public.orders;
CREATE POLICY "Accès aux commandes par le personnel authentifié" ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Lecture publique des paramètres" ON public.establishment_settings;
CREATE POLICY "Lecture publique des paramètres" ON public.establishment_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mise à jour des paramètres par les administrateurs" ON public.establishment_settings;
CREATE POLICY "Mise à jour des paramètres par les administrateurs" ON public.establishment_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Accès strict aux membres du personnel pour les admins" ON public.staff_members;
CREATE POLICY "Accès strict aux membres du personnel pour les admins" ON public.staff_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================================================
-- 5. INITIALISATION DU MENU COMPLET TIMES CAFÉ BAR & GRILL
-- Respect strict de l'ordre gastronomique universel et des prix en FCFA
-- ========================================================================

INSERT INTO public.products (nom, prix, categorie, image, dispo, description, tag)
VALUES
  ('Petit déjeuner Simple', 3000, 'petit-dejeuner', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80', true, 'Café, thé, chocolat ou lait chaud accompagné de pain frais croustillant, beurre fin et assortiment de confitures.', 'Matin Douceur'),
  ('Petit déjeuner Amélioré', 4500, 'petit-dejeuner', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80', true, 'Café, thé, chocolat ou lait chaud, 2 viennoiseries pur beurre dorées au four et verre de jus de fruits frais nature.', 'Classique'),
  ('Petit déjeuner Times', 6000, 'petit-dejeuner', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80', true, 'Café, thé, chocolat ou lait chaud, sucre ou miel pur, viennoiseries maison, omelette nature baveuse et jus frais pressé.', 'Signature Matin'),
  ('Petit déjeuner Composé', 8000, 'petit-dejeuner', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80', true, 'Boisson chaude au choix, sucre ou miel, corbeille de viennoiseries, omelette garnie jambon-fromage ou aux légumes croquants et grand jus de fruits frais.', 'Prestige Gourmand'),
  ('Salade Fattouche', 5000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue croquante, tomate fraîche, concombre, oignon vert, poivron doux, menthe, persil plat, sumak acidulé, pain pita grillé et mélasse de grenade.', 'Saveurs du Levant'),
  ('Salade Tabouleh', 5000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Semoule de blé fine, persil frais ciselé, poivron, tomate mûre, menthe fraîche, oignon vert, échalote, pur jus de citron et huile d’olive extra vierge.', 'Fraîcheur'),
  ('Salade César', 6000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Cœur de romaine, escalope de poulet grillé minute aux braises, lardons fumés dorés, copeaux de parmesan affiné et croûtons dorés à l’ail.', 'Best-Seller'),
  ('Salade Grecque', 6000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue, tomates gorgées de soleil, oignon rouge, concombre croquant, véritable feta grecque AOP, menthe fraîche, olives noires de Kalamata et origan.', NULL),
  ('Salade Niçoise', 6000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue, tomates fraîches, haricots verts fins, filets d’anchois, pommes de terre fondantes, thon émietté, œuf dur fermier, oignons et olives noires.', NULL),
  ('Salade du Chef', 6500, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue, maïs doux, carottes râpées, lamelles de gruyère suisse, tomate, oignon, œuf dur, émincé de poulet fermier, jambon supérieur et haricots verts.', 'Gourmande'),
  ('Salade Mexicana au poulet', 6500, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue, dés de tomates, gruyère, surimi, avocat fondant, escalope de poulet grillé aux épices fajitas, haricots rouges, maïs et chips tortilla croquantes.', 'Épicée & Croquante'),
  ('Hors d’œuvre Chaude', 7000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Pommes de terre fondantes, carottes glacées, haricots verts sautés, émincé de blanc de poulet tendre et sauce veloutée à la crème fraîche.', NULL),
  ('Petits pois à la viande aux pommes de terre', 7000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Petits pois doux mijotés avec morceaux de viande fondante et dés de pommes de terre rissolées dans un jus réduit aromatique.', NULL),
  ('Salade Times', 7000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Laitue, tomates fraîches, jambon supérieur, avocat hass, escalope de poulet fermier grillé à la flamme et croûtons croustillants gratinés au fromage.', 'Signature Maison'),
  ('Salade d’Avocat aux crevettes', 7000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Cœur de laitue, avocat tropical fondant, belles crevettes sauvages fraîches pochées et sauce cocktail maison subtilement relevée.', 'Fraîcheur Marine'),
  ('Vermicelle Chinoise aux œufs de caille', 7000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Vermicelles de soja translucides sautées au wok, œufs de caille mollets, petits légumes croquants et sauce soja parfumée au sésame grillé.', NULL),
  ('Hors d’œuvre Times', 8000, 'entrees-salades', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', true, 'Pommes de terre fondantes, carottes primeurs, haricots verts, boulettes de viande parfumées maison, petits pois, crème fraîche onctueuse et chiffonnade de jambon.', 'Généreux'),
  ('Gaspacho', 6000, 'soupes-potages', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', true, 'Soupe froide andalouse de tomates fraîches, poivrons rouges, concombres, ail doux, huile d’olive extra vierge et vinaigre de Xérès.', 'Fraîcheur d’Été'),
  ('Minestrone', 6000, 'soupes-potages', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', true, 'Célèbre soupe paysanne italienne mijotée aux légumes du marché, haricots blancs, petites pâtes fraîches, herbes aromatiques et parmesan.', NULL),
  ('Potage de poulet', 6000, 'soupes-potages', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', true, 'Velouté réconfortant et onctueux au blanc de volaille mijoté, petits légumes racines et trait de crème fraîche.', 'Réconfortant'),
  ('Soupe de pêcheur', 7000, 'soupes-potages', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', true, 'Bouillon marin corsé préparé avec les poissons du jour, crevettes fraîches et fruits de mer, relevé d’aromates et de safran.', 'Saveur Océane'),
  ('Pizza Margherita', 5500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Pâte fine artisanale, sauce tomate mijotée à l’origan, mozzarella fior di latte fondante et basilic frais.', 'Classique Italienne'),
  ('Pizza Bourguignonne', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate, mozzarella onctueuse, lamelles de bœuf tendre mariné, poivrons grillés et olives noires.', NULL),
  ('Pizza Végétario', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate, mozzarella fondante, poivrons multicolores, oignons doux, basilic frais et grains de maïs doré.', 'Végétarien'),
  ('Pizza du Chef', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate maison, mozzarella, émincé de poulet rôti, crème fraîche onctueuse, champignons de Paris frais et olives.', 'Coup de Cœur'),
  ('Pizza Milano', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate mijotée, mozzarella fondante, thon émietté de premier choix et olives noires à la grecque.', NULL),
  ('Pizza 4 Saisons', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate, mozzarella, jambon blanc supérieur, cœurs d’artichauts marinés, champignons frais et olives noires.', NULL),
  ('Pizza 4 Fromages', 6500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate mijotée, alliance généreuse de mozzarella fondante, gruyère affiné, parmesan reggiano et roquefort crémeux.', 'Pour les Amateurs'),
  ('Pizza Times', 7000, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce crémeuse signature, poulet rôti, viande hachée assaisonnée, poivrons croquants, oignons dorés, olives et mozzarella gratinée.', 'Signature Pizza'),
  ('Pizza Pépéroni', 7000, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate relevée, généreuse couche de mozzarella fondante et tranches de chorizo pépéroni espagnol grillé et croustillant.', NULL),
  ('Pizza Océano', 7500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate parfumée, sélection de fruits de mer (crevettes, calamars, moules), ail, persil plat et mozzarella gratinée.', 'Fruits de Mer'),
  ('Pizza Reine', 7500, 'pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate, mozzarella fondante, jambon de qualité supérieure, poivrons rouges, champignons de Paris frais et olives noires.', 'Incontournable'),
  ('Penne Arabiata', 6000, 'pastas', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80', true, 'Penne al dente enrobées d’une sauce tomate mijotée pimentée, poivrons doux revenus à l’huile d’olive et basilic frais.', 'Piquant & Savoureux'),
  ('Spaghetti Carbonara', 7000, 'pastas', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80', true, 'Spaghetti al dente, jaunes d’œufs battus, crème fraîche légère, bacon croustillant, dés de jambon et parmesan affiné.', 'Classique Italien'),
  ('Spaghetti Bolognaise', 7000, 'pastas', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80', true, 'Sauce tomate mijotée de longues heures avec viande de bœuf hachée sélectionnée, mirepoix de carottes et oignons, pointe de vin rouge et herbes.', NULL),
  ('Tagliatelle aux fruits de mer', 7000, 'pastas', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80', true, 'Tagliatelles fraîches, crevettes, calamars et moules liés dans une sauce onctueuse associant pulpe de tomate et crème fraîche parfumée à l’ail.', 'Saveurs Marines'),
  ('Tagliatelle gambas chorizo', 7500, 'pastas', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80', true, 'Tagliatelles fraîches, belles gambas poêlées au beurre blanc, tranches de chorizo ibérique grillé et coulis de tomates cerises au piment doux.', 'Terre & Mer'),
  ('Croque Monsieur', 5000, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Pain de mie artisanal beurré et toasté minute, jambon supérieur, béchamel muscade onctueuse et fromage gratiné doré au four.', NULL),
  ('Croque Madame', 5500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Notre traditionnel croque-monsieur gratiné surmonté d’un œuf au plat fermier au jaune coulant.', NULL),
  ('Chiken Burger', 5500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Filet de poulet croustillant mariné, pain brioché toasté, laitue fraîche, tomates mûres, oignons rouges et sauce burger maison crémeuse.', 'Best-Seller Poulet'),
  ('Sandwich Végétarien au fromage', 5500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Baguette fraîche croustillante, assortiment de crudités du marché, tranches de fromage fondant et mayonnaise légère aux herbes.', 'Végétarien'),
  ('Sandwich au Poulet', 5500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Pain baguette croustillant garni d’émincé de blanc de poulet sauté minute aux herbes, feuilles de laitue et tomates.', NULL),
  ('Sandwich à la Viande', 5500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Lamelles de bœuf tendre marinées et saisies à feu vif, oignons caramélisés et moutarde douce dans un pain artisanal frais.', NULL),
  ('Hamburger', 6000, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Steak haché de bœuf pur jus 150g grillé à la commande, cornichons doux, oignons rouges, rondelles de tomate, laitue et sauce barbecue maison.', NULL),
  ('Végétarien Cheese Burger', 6000, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Steak végétal savoureux grillé, double tranche de cheddar fondant, légumes frais croquants et sauce relish maison.', 'Végétarien'),
  ('Panini au Poulet', 6000, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Pain ciabatta pressé à chaud, poulet mariné aux herbes de Provence, mozzarella fondante et filet d’huile d’olive.', NULL),
  ('Sandwich au Jambon', 6500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Baguette croustillante, beurre frais de baratte, tranches généreuses de jambon blanc supérieur, emmental et cornichons.', NULL),
  ('Club Sandwich', 6500, 'burgers-sandwichs', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 'Pain de mie toasté à trois étages, escalope de poulet grillé, bacon croustillant, œuf dur, tomate, laitue et mayonnaise, servi avec frites dorées.', 'Classique Brasserie'),
  ('Houmoss', 4500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Onctueuse purée de pois chiches à la crème de sésame (tahini), jus de citron frais pressé, ail doux et filet d’huile d’olive extra vierge.', 'Mezzé Végétarien'),
  ('Houmoss à la viande', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Houmoss traditionnel et velouté garni d’émincé de filet de bœuf poêlé aux épices orientales et pignons de pin torréfiés.', 'Spécialité Maison'),
  ('Sambousek légumes', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Délicieux petits chaussons feuilletés croustillants farcis d’un mélange de légumes primeurs parfumés à la coriandre et au sumak.', NULL),
  ('Sambousek viande', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Chaussons dorés et croustillants farcis à la viande hachée pur bœuf parfumée aux sept épices libanaises et pignons.', NULL),
  ('Falafel assiette', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Boulettes dorées de pois chiches et fèves pilées aux herbes fraîches, servies avec sauce tarator au sésame, pickles et crudités.', '100% Végétal'),
  ('Kafta assiette', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Brochettes de viande de bœuf hachée assaisonnée de persil frais, oignons doux et épices d’Orient, grillées à la braise.', 'Grillade d’Orient'),
  ('Chawarma assiette', 5500, 'specialites-libanaises', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', true, 'Émincé de viande tendre marinée aux épices libanaises authentiques et rôtie à la broche, servie avec pain libanais et sauce à l’ail toum.', 'Incontournable'),
  ('Brochette de boeuf (sauce au choix)', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Morceaux choisis de bœuf tendre marinés aux aromates puis saisis à la flamme vive sur braises de bois, avec sauce au poivre, roquefort ou champignons.', 'Grillade Braisée'),
  ('Boulette de viande (sauce au choix)', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Généreuses boulettes de bœuf haché maison cuisinées minute, nappées de votre sauce préférée (sauce tomate mijotée, poivre vert ou crème fraîche).', NULL),
  ('Côte d’agneau grillé', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Côtes d’agneau premières grillées sur feu de bois, parfumées au romarin frais, fleur de sel et ail en chemise.', 'Tendre & Savoureux'),
  ('Côte de boeuf au beurre maître d’hôtel', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Belle pièce de bœuf persillée saisie à très haute température, surmontée d’un médaillon de beurre de baratte persillé au jus de citron.', 'Sélection Bouchère'),
  ('Filet de boeuf sauce aurore', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Cœur de filet de bœuf d’une tendreté exceptionnelle nappé d’une sauce aurore veloutée alliant crème fraîche et réduction de tomate fraîche.', NULL),
  ('Filet de boeuf poivron vert', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Filet de bœuf poêlé selon votre cuisson désirée, accompagné d’une réduction parfumée aux poivrons verts doux caramélisés.', NULL),
  ('Filet de boeuf à la sauce crème et champignon', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Cœur de filet tendre et juteux nappé d’une onctueuse sauce forestière aux champignons de Paris frais et crème double.', 'Best-Seller Viande'),
  ('Mignonne de boeuf au poivre vert', 8000, 'viandes-rouges', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 'Médaillon de filet mignon de bœuf saisi minute et flambé, servi avec une sauce au poivre vert frais de Madagascar liée au cognac.', 'Signature Chef'),
  ('Aile de poulet pané', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Ailes de volaille fraîches marinées aux épices douces et enrobées d’une chapelure dorée extra croustillante.', NULL),
  ('Brochette de poulet grillé', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Blancs de poulet fermier découpés en gros cubes, marinés au citron vert et thym sauvage, grillés au barbecue.', 'Léger & Grillé'),
  ('Croquette de poulet', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Bouchées fondantes de poulet haché assaisonné d’aromates fins, panées et frites à point, servies avec sauce dip.', NULL),
  ('Demi-poulet grillé', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Demi-poulet mariné pendant 12 heures dans notre mélange d’épices locales et grillé lentement sur braises ardentes.', 'Spécialité Rôtisserie'),
  ('Escalope de poulet à la sauce crème et moutarde', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Escalope de volaille saisie au beurre puis mijotée dans une sauce veloutée à la crème fraîche et moutarde à l’ancienne.', NULL),
  ('Escalope de poulet à la sauce crème et champignon', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Tendre escalope de poulet dorée minute, nappée d’une crème onctueuse aux lamelles de champignons de Paris frais.', 'Coup de Cœur'),
  ('Nuggets de poulet', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Vrais filets de poulet découpés et panés minute, moelleux à cœur et croustillants à l’extérieur.', NULL),
  ('Poulet strogonoff', 7500, 'poulets', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', true, 'Aiguillettes de poulet revenues avec champignons, oignons fondants, crème acidulée, pointe de paprika doux et moutarde.', 'Gourmand'),
  ('Brochettes de Poisson', 8000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Dés de mérou et lotte fraîchement pêchés marinés au citron vert et herbes fraîches, embrochés et saisis aux braises.', 'Pêche du Jour'),
  ('Sole meunière', 8000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Belle sole entière farinée et dorée doucement au beurre clarifié, servie avec jus de citron pressé et persil plat frais.', 'Classique Gastronomique'),
  ('Sole normande (filet de sole, crevette, champignon)', 8000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Filets de sole pochés nappés d’une réduction crémée liée aux crevettes décortiquées et champignons sautés au beurre.', 'Raffiné'),
  ('Filet de poisson à la sauce crème et champignon', 8000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Filet de poisson noble poêlé au beurre fin et nappé d’une émulsion crémeuse forestière aux champignons.', NULL),
  ('Crevettes provençales', 8000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Crevettes fraîches sautées à l’huile d’olive vierge avec tomates concassées, ail doux, persil et herbes de Provence.', NULL),
  ('Curry de poisson et crevette', 8500, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Morceaux de poisson et crevettes entières mijotés dans une sauce onctueuse au curry madras et lait de coco crémeux.', 'Épicé & Parfumé'),
  ('Duo de poisson et crevette à la sauce aurore', 8500, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Harmonieux mariage de poisson du large et crevettes royales liés par une sauce crémeuse tomatée au vin blanc.', NULL),
  ('Gambas sauté à l’ail', 12000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Belles gambas royales saisies vivement à la plancha avec beurre à l’ail frais, piment doux et persil ciselé.', 'Prestige de la Mer'),
  ('Brochettes de gambas', 12000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Gambas marinées aux zestes d’agrumes et gingembre, enfilées en brochettes et grillées au barbecue.', 'Grillade d’Exception'),
  ('Langouste grillée', 13000, 'poissons-crustaces', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 'Langouste fraîche entière coupée en deux, grillée à la flamme avec beurre maître d’hôtel fondu et citron vert.', 'Signature Prestige'),
  ('Mangnignan de kamè', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Traditionnelle sauce béninoise aux feuilles de kamè (tchayo, amanvivè), poisson fumé ou viande tendre, afitin et huile rouge.', 'Terroir Béninois'),
  ('Monyo de kamè', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Condiments frais pilonnés en sauce monyo avec réduction de kamè parfumée au piment doux et oignons verts.', NULL),
  ('Monyo poisson (fumé, frite, braisé)', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauce monyo acidulée et relevée aux tomates fraîches et oignons, servie avec poisson préparé à votre convenance (fumé, frit ou braisé).', 'Authentique'),
  ('Blôkôto', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Mijoté traditionnel riche et gélatineux aux pattes de bœuf fondantes longuement mijotées avec épices locales.', 'Spécialité Locale'),
  ('Brochettes de gésier', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Gésiers de volaille attendris, marinés aux épices de braise et grillés au feu de bois avec oignons et piments.', NULL),
  ('Brochettes de wagachi ou sauté', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Authentique fromage peul traditionnel wagashi doré à l’huile parfumée ou grillé en brochettes aux herbes.', 'Fromage Peul'),
  ('Brochettes d’escargot', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Escargots géants d’Afrique délicatement nettoyés, marinés dans une pâte d’épices et grillés au charbon.', 'Délice Exotique'),
  ('Friture d’escargot au crincrin', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Escargots dorés dans une friture d’oignons et tomates, accompagnés d’une sauce crincrin aux feuilles gluantes fraîches.', NULL),
  ('Gbôta', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Mijoté traditionnel très réputé de tête de mouton ou de porc cuite à point jusqu’à parfaite tendreté.', NULL),
  ('Kedjenou', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Ragoût traditionnel mijoté à l’étouffée sans eau ajoutée avec poulet fermier, tomates fraîches, oignons, ail et piments.', 'Spécialité Ivoirienne'),
  ('Langue de boeuf braisée ou sautée', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Langue de bœuf fondante braisée aux braises ardentes ou sautée dans une sauce tomate relevée.', NULL),
  ('Aileron braisé', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Ailerons marinés aux épices de braise locales, grillés lentement avec peau croustillante et chair tendre.', NULL),
  ('Atassi au poisson fromage', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Emblématique plat béninois de riz et haricots mijotés ensemble, servi avec sauce friture dja, poisson doré et fromage wagashi croustillant.', 'Grand Classique Bénin'),
  ('Poisson braisé à l’africaine', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Poisson entier mariné avec le kankan et les épices secrètes du chef, braisé au charbon de bois et servi avec sauce pimentée.', 'Braise Authentique'),
  ('Poulet bicyclette', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Authentique poulet local élevé en liberté à la chair ferme et musquée, braisé au feu de bois ou mijoté en sauce.', 'Poulet Fermier Local'),
  ('Poulet DG', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Célèbre plat camerounais festif de poulet doré mijoté avec rondelles de bananes plantains frites, carottes, poivrons et haricots.', 'Coup de Cœur'),
  ('Couscous royal', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Semoule fine cuite à la vapeur, assortiment de viandes tendres, légumes fondants mijotés et bouillon parfumé aux épices.', NULL),
  ('Dakouin', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Plat côtier traditionnel béninois à base de gari incorporé dans un bouillon savoureux de poissons frais mijotés aux tomates et piments.', 'Spécialité Côtière'),
  ('Tchep', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Véritable riz au gras sénégalais aux légumes généreux (chou, manioc, carotte) avec poisson noble ou viande rouge savoureuse.', 'Spécialité Sénégalaise'),
  ('Tchachanga', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Viande découpée et grillée à la perfection selon la tradition haoussa, saupoudrée de kan-kan aux arachides torréfiées et piment.', 'Street-Food Gourmand'),
  ('Viande de mouton braisé', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Morceaux de mouton marinés aux épices traditionnelles et braisés jusqu’à obtenir une croûte caramélisée et un cœur fondant.', NULL),
  ('Viande de lapin braisé', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Morceaux de lapin fermier marinés aux herbes aromatiques et braisés sur grill chaud.', 'Original & Raffiné'),
  ('Yassa (poulet ou poisson)', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Compotée d’oignons caramélisés au jus de citron vert et moutarde de Dijon, nappant un poulet fermier ou poisson braisé.', 'Saveur Acidulée'),
  ('Amanvivè, Gboman ou Tchayo (viande ou poisson)', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauces traditionnelles béninoises de feuilles amères (amanvivè), d’épinards locaux (gboman) ou de basilic (tchayo) au choix avec viande ou poisson.', NULL),
  ('Fonman', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauce béninoise traditionnelle onctueuse aux feuilles de fonman mijotées à l’huile rouge avec poisson ou viande.', NULL),
  ('Man Tindjan', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Ragoût béninois de légumes verts et viandes mélangées longuement cuisiné aux épices locales et fromage peul.', 'Plat de Fête'),
  ('Sauce Arachide (poisson ou viande de mouton)', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauce mafé riche et veloutée à base de pâte d’arachides grillées, mijotée avec poisson ou morceaux de mouton tendre.', 'Riche & Velouté'),
  ('Sauce Rouge (poisson ou viande de mouton)', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Friture rouge dja aux tomates fraîches compotées, oignons et piments doux, avec garniture au choix de poisson ou mouton.', NULL),
  ('Sauce Assrôkouin', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauce traditionnelle gluante très prisée confectionnée à partir d’amandes de pomme de cannelle pilées avec poisson ou viande.', 'Tradition Bénin'),
  ('Crincrin au poisson ou viande et mixte / Gombo', 8000, 'specialites-africaines', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, 'Sauce gluante aux feuilles fraîches de crincrin ou gombo battu, garnie de poisson noble, viande tendre ou formule mixte.', 'Incontournable'),
  ('Nems (végétarien, poulet, boeuf, poisson, crevettes)', 6000, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Rouleaux impériaux frits dorés et croustillants garniture au choix, servis avec feuilles de laitue, menthe fraîche et sauce nems maison.', 'Entrée Asiatique'),
  ('Riz sauté cantonais', 6000, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Riz jasmin sauté au wok avec petits pois, carottes croquantes, œufs battus en lanières et dés de jambon supérieur ou volaille.', 'Grand Classique Wok'),
  ('Riz sauté aux crevettes', 7500, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Riz sauté au wok à feu très vif avec belles crevettes fraîches, ciboule, œufs et sauce soja parfumée.', 'Wok de la Mer'),
  ('Nouilles sautées au poulet', 6500, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Nouilles chinoises de blé sautées avec lamelles de poulet tendre, pousses de soja fraîches et légumes croquants.', NULL),
  ('Nouilles sautées aux fruits de mer', 7500, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Nouilles sautées au wok garnies de crevettes, calamars tendres, poivrons et sauce d’huître veloutée.', 'Savoureux Wok'),
  ('Poulet sauté aux champignons noirs et bambou', 7500, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Émincé de poulet fermier sauté au wok avec champignons parfumés shiitaké, pousses de bambou et sauce soja claire.', NULL),
  ('Bœuf sauté aux oignons et poivrons', 8000, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Lamelles de bœuf marinées saisies à feu vif avec oignons croquants, poivrons multicolores et sauce au poivre de Sichuan.', 'Best-Seller Wok'),
  ('Crevettes sautées sauce piquante', 8500, 'specialites-chinoises', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80', true, 'Crevettes fraîches saisies au wok dans une sauce relevée au piment doux, gingembre frais et ail.', 'Épicé & Délicat'),
  ('Frites de pommes de terre', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Portion généreuse de frites maison dorées, croustillantes à l’extérieur et fondantes à l’intérieur.', 'Accompagnement'),
  ('Alloco (bananes plantains frites)', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Rondelles de bananes plantains mûres frites à point, dorées et doucement sucrées.', 'Coup de Cœur'),
  ('Riz blanc parfumé', 2000, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Riz jasmin de qualité supérieure cuit à la vapeur, léger et parfumé.', NULL),
  ('Riz sauté aux légumes', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Riz parfumé sauté à la poêle avec petits légumes de saison taillés en brunoise.', NULL),
  ('Pommes sautées à l’ail et persil', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Pommes de terre rissolées au beurre, ail frais pressé et persil plat du jardin.', NULL),
  ('Purée de pommes de terre maison', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Purée artisanale écrasée au beurre fin et lait entier, onctueuse et gourmande.', NULL),
  ('Légumes sautés de saison', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Poêlée de légumes croquants (courgettes, carottes, haricots verts, poivrons) à l’huile d’olive.', 'Léger'),
  ('Igname frite', 2500, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Bâtonnets d’igname blanche du Bénin frits, croustillants dehors et moelleux dedans.', 'Terroir'),
  ('Attieké', 2000, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Semoule de manioc fermentée et cuite à la vapeur, légèrement acidulée et aérée.', NULL),
  ('Pain Pita ou Pain Maison', 1000, 'accompagnements', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, 'Corbeille de pain artisanal frais cuit du jour.', NULL),
  ('Coupe de fruits frais de saison', 3500, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Assortiment de fruits tropicaux frais du marché : ananas pain de sucre, pastèque juteuse, mangue et papaye.', 'Léger & Nature'),
  ('Salade de fruits frais', 3500, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Méli-mélo de fruits frais découpés en dés dans un sirop léger au jus d’orange et feuilles de menthe.', NULL),
  ('Fondant au chocolat noir cœur coulant', 4500, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Gâteau au chocolat noir 70% servi tiède, cœur intensément coulant, accompagné d’une boule de glace vanille.', 'Gourmandise Absolue'),
  ('Tiramisu artisanal au café', 4500, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Véritable crème mascarpone aérée, biscuits cuillère imbibés d’espresso TIMES et poudre de cacao brut.', 'Fait Maison'),
  ('Crêpe au Nutella ou confiture', 3500, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Grande crêpe fine préparée minute, garnie généreusement au Nutella fondant ou confiture de fruits.', NULL),
  ('Coupe 2 boules de glace au choix', 3000, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Parfums disponibles : vanille de Madagascar, chocolat intense, fraise, mangue, café ou pistache.', NULL),
  ('Coupe 3 boules de glace au choix', 4000, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Trois boules de glaces artisanales au choix avec nuage de crème chantilly maison et amandes effilées.', NULL),
  ('Crème brûlée à la vanille de Madagascar', 4000, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Crème onctueuse infusée aux véritables gousses de vanille bourbon, caramélisée au sucre roux minute.', 'Classique Brasserie'),
  ('Moelleux aux pommes ou tarte du chef', 4000, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', true, 'Pâtisserie artisanale du jour préparée avec des ingrédients frais de saison par notre chef pâtissier.', NULL),
  ('Espresso', 1500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Café court à la crema onctueuse, torréfaction artisanale et extraction soignée.', 'Barista'),
  ('Double Espresso', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Double extraction de café intense et corsé pour faire le plein d’énergie.', NULL),
  ('Café au lait / Cappuccino', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Espresso surmonté d’une micro-mousse de lait soyeuse et saupoudré d’une touche de cacao.', NULL),
  ('Chocolat chaud maison', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Chocolat au lait entier crémeux et velouté préparé à l’ancienne.', NULL),
  ('Thé & Infusions (menthe, vert, noir, verveine)', 2000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Sélection de thés d’origine et infusions de plantes fraîches au choix.', NULL),
  ('Eau minérale Possotomé 1.5L', 1500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Grande bouteille d’eau minérale naturelle de source locale de Possotomé.', NULL),
  ('Eau minérale Possotomé 0.5L', 1000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Petite bouteille d’eau minérale naturelle servie fraîche.', NULL),
  ('Eau gazeuse Perrier / San Pellegrino', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Eau minérale pétillante servie fraîche avec rondelle de citron vert.', NULL),
  ('Sodas (Coca-Cola, Fanta, Sprite, Schweppes Tonic)', 1500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Canette ou bouteille en verre 33cl servie très fraîche avec glaçons et citron.', NULL),
  ('Energy Drink Red Bull', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Boisson énergisante servie très fraîche.', NULL),
  ('Jus d’ananas frais pressé', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, '100% pur jus d’ananas pain de sucre d’Allada pressé à la minute sans eau ajoutée.', '100% Pur Jus Local'),
  ('Jus d’orange pressée', 3000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Oranges fraîches pressées à la commande pour faire le plein de vitamines.', NULL),
  ('Jus de bissap maison', 2000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Infusion traditionnelle de calices d’hibiscus, subtilement sucrée et parfumée à la menthe fraîche.', 'Boisson Africaine'),
  ('Jus de gingembre maison', 2000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Extraction tonifiante de racine de gingembre frais relevée d’une touche de citron vert et ananas.', 'Énergisant Naturel'),
  ('Jus de mangue ou fruits de la passion', 2500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Nectar onctueux de fruits tropicaux gorgés de soleil.', NULL),
  ('Virgin Mojito', 4000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Feuilles de menthe fraîche pilées, quartiers de citron vert, sirop de canne et eau gazeuse rafraîchissante.', 'Mocktail Frais'),
  ('Virgin Colada', 4000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Onctueuse émulsion de pur jus d’ananas et crème de noix de coco avec touche de vanille.', NULL),
  ('Smoothie Tropical Mangue-Banane', 4000, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Fruits frais mixés minute avec yaourt nature crémeux et filet de miel pur.', NULL),
  ('Cocktail Times Sunset Sans Alcool', 4500, 'boissons-non-alcoolisees', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 'Création maison dégradée aux jus d’orange, ananas frais, purée de passion et coulis de grenadine.', 'Création Maison'),
  ('La Béninoise', 1500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde nationale emblématique du Bénin, rafraîchissante et légère (65cl).', 'Bière Locale'),
  ('Castel Beer', 1500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde panafricaine désaltérante servie très fraîche (65cl).', NULL),
  ('Beaufort Lager', 2000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde premium raffinée au goût équilibré (50cl).', NULL),
  ('Doppel Munich', 2000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière brune de caractère aux arômes intenses de malt torréfié (50cl).', NULL),
  ('Heineken', 2500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde internationale de référence (33cl).', NULL),
  ('Guinness Extra Stout', 2500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Stout noir irlandais robuste aux notes de café et cacao amer.', NULL),
  ('Corona Extra', 3000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde mexicaine légère servie avec son quartier de citron vert frais dans le goulot.', NULL),
  ('Desperados', 3000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bière blonde aromatisée à la tequila et zestes d’agrumes.', NULL),
  ('Ricard / Pastis 51', 3000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Grand classique anisé de Marseille servi avec glaçons et carafe d’eau fraîche.', NULL),
  ('Martini Blanc / Rouge', 3500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Vermouth italien servi sur lit de glace avec zeste de citron ou olive.', NULL),
  ('Campari Bitter', 3500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Amer italien rouge aux herbes aromatiques, servi sec ou avec trait d’eau gazeuse.', NULL),
  ('Mojito Classique', 5500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Rhum blanc agricole, menthe fraîche pilée, jus de citron vert pressé, cassonade, eau gazeuse et bitter.', 'Cocktail Star'),
  ('Piña Colada', 6000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Rhum blanc, rhum brun, crème de coco veloutée et jus d’ananas frais pressé mixés à la glace pilée.', NULL),
  ('Caïpirinha', 5500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Véritable cachaça brésilienne, quartiers de citrons verts écrasés et sucre de canne.', NULL),
  ('Margarita', 6000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Tequila 100% agave, triple sec Cointreau, jus de citron vert frais et givrage au sel fin.', NULL),
  ('Long Island Iced Tea', 7000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Mélange puissant de vodka, gin, rhum blanc, tequila et triple sec avec jus de citron et cola.', 'Cocktail Fort'),
  ('Times Signature Cocktail', 7500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Création exclusive de notre chef barman : rhum ambré vieilli, liqueur de fruits de la passion, jus d’ananas rôti et bitter fumé.', 'Signature Bar'),
  ('Verre de vin (Rouge, Blanc ou Rosé)', 3500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Sélection soignée de notre sommelier au verre parmi les domaines français réputés.', NULL),
  ('Bouteille de vin Rouge sélection AOP', 18000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bouteille 75cl sélectionnée (Bordeaux AOP ou Côtes-du-Rhône) aux arômes de fruits rouges mûrs et tanins fins.', NULL),
  ('Bouteille de vin Blanc sec', 18000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bouteille 75cl Sauvignon ou Chardonnay, vif, minéral et fruité, parfait avec nos poissons et fruits de mer.', NULL),
  ('Bouteille de vin Rosé de Provence', 20000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bouteille 75cl AOP Côtes de Provence, robe pâle, notes d’agrumes et fraîcheur élégante.', NULL),
  ('Bouteille Moët & Chandon Brut Impérial', 75000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Champagne de prestige mondial, bulles fines et vives, arômes de fruits blancs et brioche dorée.', 'Champagne d’Exception'),
  ('Bouteille Veuve Clicquot Ponsardin', 85000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Champagne brut carte jaune, puissance et élégance aromatique reconnue.', 'Prestige'),
  ('Jack Daniel’s Old No. 7 (verre)', 5000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Tennessee whiskey américain filtré goutte à goutte sur charbon de bois d’érable.', NULL),
  ('Johnnie Walker Black Label (verre)', 6000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Blended scotch whisky 12 ans d’âge aux notes riches, douces et fumées.', NULL),
  ('Chivas Regal 12 ans (verre)', 6000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Scotch whisky velouté aux notes de miel sauvage, vanille et noisette.', NULL),
  ('Jameson Irish Whiskey (verre)', 5000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Whiskey irlandais triple distillation d’une remarquable rondeur.', NULL),
  ('Bouteille Jack Daniel’s', 45000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bouteille 70cl servie avec glaçons et accompagnements de sodas au choix.', NULL),
  ('Bouteille Johnnie Walker Black Label', 55000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Bouteille 70cl servie avec seau à glace et sodas.', NULL),
  ('Baileys Original Irish Cream (verre)', 4500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Onctueuse crème de whisky irlandais servie bien fraîche sur glace.', NULL),
  ('Jägermeister (verre / shot)', 4500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Liqueur allemande aux 56 herbes servie glacée en shot givré.', NULL),
  ('Cognac Hennessy VS (verre)', 7000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Cognac d’exception aux notes boisées, d’épices douces et de fruits secs.', 'Prestige'),
  ('Cognac Rémy Martin VSOP (verre)', 8500, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Cognac Fine Champagne équilibré aux arômes de vanille et d’abricot mûr.', NULL),
  ('Get 27 (verre)', 4000, 'boissons-alcoolisees', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', true, 'Liqueur de menthe poivrée intense servie sur lit de glace pilée.', NULL)
ON CONFLICT (nom) DO UPDATE SET
  name = COALESCE(EXCLUDED.name::text, EXCLUDED.nom::text),
  nom = COALESCE(EXCLUDED.nom::text, EXCLUDED.name::text),
  price = COALESCE(EXCLUDED.price, EXCLUDED.prix),
  prix = COALESCE(EXCLUDED.prix, EXCLUDED.price),
  category_id = COALESCE(EXCLUDED.category_id::text, EXCLUDED.categorie::text),
  categorie = COALESCE(EXCLUDED.categorie::text, EXCLUDED.category_id::text),
  image_url = COALESCE(EXCLUDED.image_url::text, EXCLUDED.image::text),
  image = COALESCE(EXCLUDED.image::text, EXCLUDED.image_url::text),
  is_available = COALESCE(EXCLUDED.is_available, EXCLUDED.dispo, true),
  dispo = COALESCE(EXCLUDED.dispo, EXCLUDED.is_available, true),
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  updated_at = timezone('utc'::text, now());
