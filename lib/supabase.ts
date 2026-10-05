import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Configuration Supabase pour synchronisation Cloud & Vercel / GitHub
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://times-restaurant-placeholder.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWVzLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholderKey';

// Client Supabase unique (sécurisé contre les accès SSR à window/localStorage)
export const isSupabaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

export type { User, Session };

// ==========================================
// TYPAGES DU MENU ET DES COMMANDES
// ==========================================

export type ProductCategory =
  | 'petit-dejeuner'
  | 'entrees-salades'
  | 'soupes-potages'
  | 'pizzas'
  | 'pastas'
  | 'burgers-sandwichs'
  | 'specialites-libanaises'
  | 'viandes-rouges'
  | 'poulets'
  | 'poissons-crustaces'
  | 'specialites-africaines'
  | 'specialites-chinoises'
  | 'accompagnements'
  | 'desserts'
  | 'boissons-non-alcoolisees'
  | 'boissons-alcoolisees'
  | 'cafe'
  | 'bar'
  | 'grill';

export interface CategoryDefinition {
  id: ProductCategory;
  label: string;
  group: 'petit-dejeuner' | 'entrees-salades' | 'soupes-potages' | 'plats-principaux' | 'accompagnements' | 'desserts' | 'boissons-non-alcoolisees' | 'boissons-alcoolisees';
  groupLabel: string;
  iconName: string;
  order: number;
}

export const GASTRONOMIC_CATEGORIES: CategoryDefinition[] = [
  { id: 'petit-dejeuner', label: 'Petit-Déjeuner', group: 'petit-dejeuner', groupLabel: 'Petit-Déjeuner', iconName: 'Coffee', order: 1 },
  { id: 'entrees-salades', label: 'Entrées & Salades', group: 'entrees-salades', groupLabel: 'Entrées & Salades', iconName: 'Salad', order: 2 },
  { id: 'soupes-potages', label: 'Soupes & Potages', group: 'soupes-potages', groupLabel: 'Soupes & Potages', iconName: 'Soup', order: 3 },
  { id: 'pizzas', label: 'Pizzas', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Pizza', order: 4 },
  { id: 'pastas', label: 'Pastas', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'UtensilsCrossed', order: 5 },
  { id: 'burgers-sandwichs', label: 'Burgers & Sandwichs', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Sandwich', order: 6 },
  { id: 'specialites-libanaises', label: 'Spécialités Libanaises', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Sparkles', order: 7 },
  { id: 'viandes-rouges', label: 'Viandes Rouges', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Flame', order: 8 },
  { id: 'poulets', label: 'Poulets', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Drumstick', order: 9 },
  { id: 'poissons-crustaces', label: 'Poissons & Crustacés', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Fish', order: 10 },
  { id: 'specialites-africaines', label: 'Spécialités Africaines', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'Globe', order: 11 },
  { id: 'specialites-chinoises', label: 'Spécialités Chinoises', group: 'plats-principaux', groupLabel: 'Plats Principaux', iconName: 'ChefHat', order: 12 },
  { id: 'accompagnements', label: 'Accompagnements', group: 'accompagnements', groupLabel: 'Accompagnements', iconName: 'Layers', order: 13 },
  { id: 'desserts', label: 'Desserts', group: 'desserts', groupLabel: 'Desserts', iconName: 'CakeSlice', order: 14 },
  { id: 'boissons-non-alcoolisees', label: 'Boissons Sans Alcool', group: 'boissons-non-alcoolisees', groupLabel: 'Boissons Non Alcoolisées', iconName: 'CupSoda', order: 15 },
  { id: 'boissons-alcoolisees', label: 'Boissons Alcoolisées', group: 'boissons-alcoolisees', groupLabel: 'Boissons Alcoolisées', iconName: 'Wine', order: 16 },
];

export interface ProductOptionChoice {
  label: string;
  priceExtra?: number; // Ex: +500 FCFA
}

export interface ProductOption {
  name: string; // Ex: 'Cuisson', 'Sauce au choix', 'Taille', 'Suppléments'
  type?: 'select' | 'radio' | 'checkbox';
  required?: boolean;
  choices: (ProductOptionChoice | string)[];
}

export interface Product {
  id?: string;

  // 1. Attributs natifs Supabase (Colonnes officielles de la table products)
  category_id: ProductCategory | string;
  name: string;
  description?: string;
  price: number; // Prix en FCFA
  image_url: string;
  is_available: boolean;
  options?: ProductOption[] | Record<string, unknown>[] | string[];
  tag?: string | string[];
  tags?: string[];

  // 2. Alias de rétrocompatibilité (Garantit le bon fonctionnement immédiat des composants)
  nom: string;
  prix: number;
  categorie: ProductCategory | string;
  image: string;
  dispo: boolean;
  disponible?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  nom: string;
  name?: string;
  prix: number; // Toujours en FCFA
  price?: number;
  quantity: number;
  categorie?: string;
  category_id?: string;
  optionsSelected?: string[];
  notes?: string;
}

export type ConsumptionMode = 'sur_place' | 'a_emporter' | 'livraison';
export type OrderStatus = 'Commande en cours' | 'en_attente' | 'en_preparation' | 'prete' | 'terminee' | 'annulee';
export type PaymentProvider = 'fedapay' | 'kkiapay' | 'especes' | 'carte_sur_place' | 'sur_place';
export type PaymentStatus = 'paye' | 'en_attente' | 'echoue';

export interface Order {
  id?: string;
  items: OrderItem[];
  total: number; // En FCFA
  totalXof?: number; // En FCFA
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  consumptionMode: ConsumptionMode;
  tableNumber?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryNotes?: string;
  status: OrderStatus;
  notes?: string;
  tableOrRoom?: string;
  createdAt: string;

  // Données de paiement Mobile Money & Carte
  paymentStatus?: PaymentStatus;
  paymentProvider?: PaymentProvider;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  receiptNumber?: string;
  currency?: 'XOF';
  amountPaid?: number;
}

export interface EstablishmentSettings {
  nomEtablissement: string;
  whatsappOfficiel: string;
  logoUrl: string | null;
  telephone?: string;
  adresse?: string;
  email?: string;
  devisePrincipale?: string;
  updatedAt?: string;

  // Textes légaux & Conformité
  cguCustomText?: string;
  politiqueConfidentialiteCustomText?: string;
  reglesAnnulationCustomText?: string;
  dpoEmail?: string;
  legalLastUpdated?: string;
}

// ==========================================
// TYPAGES DU PERSONNEL & GESTION DES RÔLES
// ==========================================

export type StaffRole = 'admin' | 'manager' | 'cuisine' | 'bar' | 'salle';

export interface StaffMember {
  id: string;
  nom: string;
  email: string;
  role: StaffRole;
  actif: boolean;
  telephone?: string;
  createdAt?: string;
  derniereConnexion?: string;
}
