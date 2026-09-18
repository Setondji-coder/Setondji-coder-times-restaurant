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

export interface Product {
  id?: string;
  nom: string;
  prix: number; // Toujours en FCFA
  categorie: 'cafe' | 'bar' | 'grill' | 'dessert';
  image: string;
  dispo: boolean;
  description?: string;
  tag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  nom: string;
  prix: number; // Toujours en FCFA
  quantity: number;
  categorie?: string;
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
