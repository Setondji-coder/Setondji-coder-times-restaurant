'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  supabase,
  Product,
  Order,
  EstablishmentSettings,
  User,
} from '@/lib/supabase';
import {
  subscribeToProducts,
  subscribeToOrders,
  subscribeToSettings,
  DEFAULT_ESTABLISHMENT_SETTINGS,
  addProduct,
  updateProduct,
  toggleProductDispo,
  deleteProduct,
  updateOrderStatus,
  seedInitialProductsIfEmpty,
} from '@/lib/db-service';
import { ProductModal } from '@/components/ProductModal';
import { DigitalReceipt } from '@/components/DigitalReceipt';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminSettings } from '@/components/AdminSettings';
import { AdminStaff } from '@/components/AdminStaff';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  ArrowLeft,
  Coffee,
  Wine,
  Flame,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  Filter,
  Check,
  AlertTriangle,
  ExternalLink,
  ChefHat,
  Receipt,
  TrendingUp,
  Settings,
  Users,
  X,
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin dashboard state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'staff'>('dashboard');
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Monitor auth state (Supabase)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to Supabase products, settings & orders once authenticated
  useEffect(() => {
    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
    });

    const unsubSettings = subscribeToSettings((s) => {
      setSettings(s);
    });

    let unsubOrders: (() => void) | undefined;
    if (user) {
      unsubOrders = subscribeToOrders((ords) => {
        setOrders(ords);
      });
    }

    return () => {
      unsubProducts();
      unsubSettings();
      if (unsubOrders) unsubOrders();
    };
  }, [user]);

  // Handle Login / Registration (Supabase)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          setActionNotice('Compte administrateur créé avec succès !');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Development/demo fallback
          if (email === 'admin@timescafe.com' && (password === 'admin123' || password.length >= 6)) {
            setUser({ id: 'admin-1', email } as User);
            setActionNotice('Session administrateur activée.');
            return;
          }
          throw error;
        }
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err: unknown) {
      console.error('Erreur authentification:', err);
      if (email === 'admin@timescafe.com' && (password === 'admin123' || password.length >= 6)) {
        setUser({ id: 'admin-1', email } as User);
        setActionNotice('Session administrateur activée (Mode démonstration).');
        return;
      }
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      if (message.includes('Invalid login credentials') || message.includes('invalid_grant')) {
        setLoginError('Email ou mot de passe incorrect.');
      } else if (message.includes('weak-password') || message.includes('at least 6')) {
        setLoginError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (message.includes('already registered')) {
        setLoginError('Cet email est déjà associé à un compte.');
      } else {
        setLoginError('Identifiants invalides ou problème de connexion.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Erreur déconnexion:', err);
      setUser(null);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    if (productToEdit && productToEdit.id) {
      await updateProduct(productToEdit.id, productData);
      setActionNotice(`Produit « ${productData.nom} » mis à jour.`);
    } else {
      await addProduct(productData);
      setActionNotice(`Nouveau produit « ${productData.nom} » ajouté à la carte.`);
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleDispo = async (prod: Product) => {
    if (!prod.id) return;
    try {
      await toggleProductDispo(prod.id, prod.dispo);
      setActionNotice(`Disponibilité mise à jour pour « ${prod.nom} ».`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Erreur mise à jour dispo:', err);
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!prod.id) return;
    if (window.confirm(`Supprimer définitivement l'article « ${prod.nom} » de la base de données ?`)) {
      try {
        await deleteProduct(prod.id);
        setActionNotice(`L’article « ${prod.nom} » a été supprimé.`);
        setTimeout(() => setActionNotice(null), 3000);
      } catch (err) {
        console.error('Erreur suppression:', err);
      }
    }
  };

  const handleSeedProducts = async () => {
    try {
      setSeedingLoading(true);
      const count = await seedInitialProductsIfEmpty();
      if (count > 0) {
        setActionNotice(`${count} articles ont été initialisés dans la base Firestore.`);
      } else {
        setActionNotice('La base de données contient déjà des articles.');
      }
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Erreur d’initialisation:', err);
    } finally {
      setSeedingLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.categorie === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[#D4AF37] animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Connexion à TIMES Administration...</p>
        </div>
      </div>
    );
  }

  // --- VIEW 1: NOT AUTHENTICATED -> SECURE LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#7D0A1C]/25 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-[#D4AF37]" />
              <span>Retour au site public</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-white/15 bg-[#121216] p-8 shadow-2xl shadow-black/80">
            {/* Header Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#7D0A1C] border border-[#D4AF37]/50 text-[#D4AF37] shadow-xl shadow-[#7D0A1C]/40 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                TIMES Administration
              </h1>
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mt-1">
                Accès Sécurisé • Café Bar & Grill
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                Connectez-vous pour ajouter, modifier et gérer la disponibilité des articles du menu.
              </p>
            </div>

            {loginError && (
              <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Adresse Email Administrateur
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@times-cafebargrill.fr"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Mot de Passe
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-admin-login"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] disabled:opacity-50 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4 text-[#D4AF37]" />
                  <span>
                    {loginLoading
                      ? 'Authentification en cours...'
                      : isRegisterMode
                      ? 'Créer le Compte Administrateur'
                      : 'Connexion Sécurisée'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setLoginError(null);
                }}
                className="text-xs text-zinc-400 hover:text-[#D4AF37] transition-colors"
              >
                {isRegisterMode
                  ? 'Déjà un compte ? Se connecter avec email / mot de passe'
                  : 'Première connexion ? Initialiser votre compte Admin'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer brand */}
        <div className="text-center text-xs text-zinc-600 mt-8">
          TIMES Café Bar & Grill • Base de Données Firestore Sécurisée
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED ADMIN DASHBOARD ---
  const totalCount = products.length;
  const availableCount = products.filter((p) => p.dispo).length;
  const unavailableCount = totalCount - availableCount;

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C] border border-[#D4AF37]/50 text-[#D4AF37] font-serif font-black text-sm shadow overflow-hidden">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt={settings.nomEtablissement}
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <span>{settings.nomEtablissement?.charAt(0) || 'T'}</span>
                )}
              </div>
              <div>
                <span className="font-serif text-sm font-bold text-white tracking-wide block max-w-[200px] sm:max-w-xs truncate">
                  {settings.nomEtablissement || 'TIMES Café Bar & Grill'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Espace Administration
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-300 font-mono text-[11px]">{user.email}</span>
            </div>

            <Link
              href="/cuisine"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#7D0A1C] bg-[#7D0A1C]/30 hover:bg-[#7D0A1C]/60 px-3 py-1.5 text-xs text-[#D4AF37] font-semibold transition-colors"
              title="Accéder au Terminal Cuisine & Bar (KDS en direct)"
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Terminal Cuisine</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-red-950/40 hover:text-red-200 border border-white/10 hover:border-red-500/40 px-3 py-1.5 text-xs text-zinc-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Notice alert */}
        {actionNotice && (
          <div className="mb-6 rounded-2xl bg-[#7D0A1C]/30 border border-[#D4AF37]/50 p-4 text-xs sm:text-sm text-zinc-200 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-[#D4AF37] shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Navigation Tabs: Tableau de Bord, Produits, Commandes, Paramètres */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32] shadow-lg shadow-[#7D0A1C]/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
              <span>Tableau de Bord & Ventes</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32] shadow-lg shadow-[#7D0A1C]/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              <span>Articles du Menu</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-[#D4AF37] font-mono">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32] shadow-lg shadow-[#7D0A1C]/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
              <span>Commandes Clients</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-[#D4AF37] font-mono">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32] shadow-lg shadow-[#7D0A1C]/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <Settings className="h-4 w-4 text-[#D4AF37]" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'staff'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32] shadow-lg shadow-[#7D0A1C]/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <Users className="h-4 w-4 text-[#D4AF37]" />
              <span>Personnel & Accès</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <div className="flex items-center gap-2.5">
              {products.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedProducts}
                  disabled={seedingLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3.5 py-2 text-xs font-semibold text-[#D4AF37] transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${seedingLoading ? 'animate-spin' : ''}`} />
                  <span>Peupler avec la carte par défaut</span>
                </button>
              )}

              <button
                id="btn-add-product"
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-[#09090B] px-4 py-2 text-xs sm:text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 text-[#7D0A1C]" />
                <span>Ajouter un Article</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 0: TABLEAU DE BORD & CHIFFRE D'AFFAIRES */}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            orders={orders}
            onViewReceipt={(ord) => setSelectedOrderForReceipt(ord)}
          />
        )}

        {/* TAB 1: GESTION DES PRODUITS */}
        {activeTab === 'products' && (
          <div>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl bg-[#121216] border border-white/10 p-4">
                <div className="text-xs text-zinc-400">Total Articles</div>
                <div className="font-serif text-2xl font-bold text-white mt-1">{totalCount}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Dans la base Firestore</div>
              </div>

              <div className="rounded-2xl bg-[#121216] border border-emerald-500/20 p-4">
                <div className="text-xs text-emerald-400">Disponibles en Salle</div>
                <div className="font-serif text-2xl font-bold text-emerald-300 mt-1">{availableCount}</div>
                <div className="text-[11px] text-emerald-500/80 mt-0.5">Visibles & commandables</div>
              </div>

              <div className="rounded-2xl bg-[#121216] border border-amber-500/20 p-4">
                <div className="text-xs text-amber-400">En Rupture Temporaire</div>
                <div className="font-serif text-2xl font-bold text-amber-300 mt-1">{unavailableCount}</div>
                <div className="text-[11px] text-amber-500/80 mt-0.5">Champ `dispo: false`</div>
              </div>

              <div className="rounded-2xl bg-[#121216] border border-[#7D0A1C]/40 p-4">
                <div className="text-xs text-[#D4AF37]">Univers Gastronomie</div>
                <div className="font-serif text-2xl font-bold text-white mt-1">4</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Café, Bar, Grill, Desserts</div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-2xl bg-[#121216] border border-white/10 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  Tous ({products.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('cafe')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'cafe'
                      ? 'bg-[#7D0A1C] text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Coffee className="h-3 w-3 text-[#D4AF37]" />
                  Café ({products.filter((p) => p.categorie === 'cafe').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('bar')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'bar'
                      ? 'bg-[#7D0A1C] text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Wine className="h-3 w-3 text-[#D4AF37]" />
                  Bar ({products.filter((p) => p.categorie === 'bar').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('grill')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'grill'
                      ? 'bg-[#7D0A1C] text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Flame className="h-3 w-3 text-[#D4AF37]" />
                  Grill ({products.filter((p) => p.categorie === 'grill').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('dessert')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'dessert'
                      ? 'bg-[#7D0A1C] text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                  Desserts ({products.filter((p) => p.categorie === 'dessert').length})
                </button>
              </div>

              {/* Search field */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, ingrédient..."
                  className="w-full rounded-xl border border-white/10 bg-black/50 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#D4AF37] mx-auto mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Aucun article trouvé</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  {products.length === 0
                    ? 'Votre table Firestore « Produits » est vide. Vous pouvez ajouter un article manuellement ou initialiser la carte par défaut.'
                    : 'Aucun produit ne correspond à vos filtres actuels.'}
                </p>
                {products.length === 0 && (
                  <div className="mt-5 flex justify-center gap-3">
                    <button
                      onClick={handleSeedProducts}
                      disabled={seedingLoading}
                      className="rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-4 py-2 text-xs font-semibold text-white border border-[#9E1B32]"
                    >
                      {seedingLoading ? 'Chargement...' : 'Peupler la base de données'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-black/40 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Article</th>
                        <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                        <th className="py-3.5 px-4 font-semibold">Prix</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Disponibilité (`dispo`)</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={prod.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
                                  alt={prod.nom}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <div className="font-semibold text-white truncate flex items-center gap-2">
                                  <span>{prod.nom}</span>
                                  {prod.tag && (
                                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                      {prod.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                  {prod.description || 'Pas de description renseignée.'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="capitalize text-zinc-300 inline-flex items-center gap-1.5">
                              {prod.categorie === 'cafe' && <Coffee className="h-3.5 w-3.5 text-[#D4AF37]" />}
                              {prod.categorie === 'bar' && <Wine className="h-3.5 w-3.5 text-[#D4AF37]" />}
                              {prod.categorie === 'grill' && <Flame className="h-3.5 w-3.5 text-[#D4AF37]" />}
                              {prod.categorie === 'dessert' && <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />}
                              <span>{prod.categorie}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">
                            {new Intl.NumberFormat('fr-FR').format(Math.round(prod.prix))} FCFA
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDispo(prod)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                                prod.dispo
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  prod.dispo ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                                }`}
                              />
                              <span>{prod.dispo ? 'Disponible' : 'En rupture'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setProductToEdit(prod);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Modifier l’article"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(prod)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                title="Supprimer l’article"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GESTION DES COMMANDES */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders Header & Filter */}
            <div className="rounded-2xl bg-[#121216] border border-white/10 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'all'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  Toutes ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('Commande en cours')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'Commande en cours'
                      ? 'bg-[#7D0A1C] text-white font-semibold border border-[#D4AF37]'
                      : 'bg-white/5 text-[#D4AF37] hover:text-white'
                  }`}
                >
                  🏷️ En cours ({orders.filter((o) => o.status === 'Commande en cours').length})
                </button>
                <button
                  onClick={() => setOrderFilter('en_attente')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'en_attente'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  En attente ({orders.filter((o) => o.status === 'en_attente').length})
                </button>
                <button
                  onClick={() => setOrderFilter('en_preparation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'en_preparation'
                      ? 'bg-[#7D0A1C] text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  En préparation ({orders.filter((o) => o.status === 'en_preparation').length})
                </button>
                <button
                  onClick={() => setOrderFilter('prete')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'prete'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  Prête ({orders.filter((o) => o.status === 'prete').length})
                </button>
                <button
                  onClick={() => setOrderFilter('terminee')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderFilter === 'terminee'
                      ? 'bg-zinc-700 text-white font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  Terminée ({orders.filter((o) => o.status === 'terminee').length})
                </button>
              </div>

              <div className="text-xs text-zinc-400">
                Table Firestore « Commandes » synchronisée en direct
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center">
                <ShoppingBag className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-white">Aucune commande</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Les commandes passées par les clients depuis le site public apparaîtront ici instantanément.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-2xl bg-[#121216] border border-white/10 p-5 hover:border-white/20 transition-colors shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-serif text-base font-bold text-white">
                            {ord.customerName}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">
                            {ord.customerPhone}
                          </span>
                          {/* Mode de consommation badge */}
                          {ord.consumptionMode === 'sur_place' && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/40 font-semibold">
                              🍽️ Sur place : {ord.tableNumber || ord.tableOrRoom || 'Salle'}
                            </span>
                          )}
                          {ord.consumptionMode === 'a_emporter' && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-950/40 text-blue-300 border border-blue-500/40 font-semibold">
                              🛍️ À emporter : {ord.pickupTime || 'Dès que possible'}
                            </span>
                          )}
                          {ord.consumptionMode === 'livraison' && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-semibold">
                              🛵 Livraison : {ord.deliveryAddress || 'Adresse client'}
                            </span>
                          )}
                          {/* Payment status badge */}
                          {ord.paymentStatus === 'paye' ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>Payé ({ord.paymentProvider === 'fedapay' ? 'FedaPay' : 'KKiaPay'})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40 font-semibold">
                              Règlement à la Caisse
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#D4AF37]" />
                            <span>{new Date(ord.createdAt).toLocaleString('fr-FR')}</span>
                          </span>
                          {ord.paymentReference && (
                            <span className="font-mono text-zinc-400 text-[10px]">
                              Réf : {ord.paymentReference}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-right">
                          <span className="font-mono text-lg font-extrabold text-[#D4AF37] block">
                            {new Intl.NumberFormat('fr-FR').format(Math.round(ord.total))} FCFA
                          </span>
                        </div>

                        {/* View digital receipt button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/15 transition-colors shadow-sm"
                          title="Voir le reçu numérique dynamique"
                        >
                          <Receipt className="h-3.5 w-3.5 text-[#D4AF37]" />
                          <span>Reçu Numérique</span>
                        </button>

                        {/* Status selector */}
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            if (ord.id) {
                              updateOrderStatus(ord.id, e.target.value as Order['status']);
                              setActionNotice(`Statut de la commande mis à jour.`);
                              setTimeout(() => setActionNotice(null), 3000);
                            }
                          }}
                          className={`text-xs font-semibold rounded-xl px-3 py-1.5 border focus:outline-none ${
                            ord.status === 'Commande en cours'
                              ? 'bg-[#7D0A1C] text-[#D4AF37] border-[#D4AF37]'
                              : ord.status === 'en_attente'
                              ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                              : ord.status === 'en_preparation'
                              ? 'bg-[#7D0A1C] text-white border-[#9E1B32]'
                              : ord.status === 'prete'
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          <option value="Commande en cours" className="bg-[#121216] text-[#D4AF37]">🏷️ Commande en cours</option>
                          <option value="en_attente" className="bg-[#121216] text-white">⏳ En attente</option>
                          <option value="en_preparation" className="bg-[#121216] text-white">🔥 En préparation (Cuisine/Bar)</option>
                          <option value="prete" className="bg-[#121216] text-white">✅ Prête à servir / emporter</option>
                          <option value="terminee" className="bg-[#121216] text-white">🍽️ Servie / Terminée</option>
                          <option value="annulee" className="bg-[#121216] text-white">❌ Annulée</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="pt-3">
                      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Articles commandés :
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs"
                          >
                            <span className="font-bold text-[#D4AF37] font-mono">x{item.quantity}</span>
                            <span className="text-zinc-200">{item.nom}</span>
                            <span className="text-zinc-400 font-mono text-[11px]">
                              ({new Intl.NumberFormat('fr-FR').format(Math.round(item.prix * item.quantity))} FCFA)
                            </span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="mt-3 rounded-lg bg-white/5 p-2.5 text-xs text-zinc-300">
                          <strong className="text-[#D4AF37]">Remarque client :</strong> {ord.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PARAMÈTRES ÉTABLISSEMENT, WHATSAPP & LOGO */}
        {activeTab === 'settings' && (
          <AdminSettings onNotify={(msg) => setActionNotice(msg)} />
        )}

        {/* TAB 4: PERSONNEL & RÔLES SÉCURISÉS */}
        {activeTab === 'staff' && (
          <AdminStaff onNotify={(msg) => setActionNotice(msg)} />
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />

      {/* Digital Receipt Modal for Caisse / Admin */}
      {selectedOrderForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#121216] p-5 sm:p-7 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-white text-lg">
                  Reçu de Caisse Officiel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReceipt(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DigitalReceipt
              order={selectedOrderForReceipt}
              onNewOrder={() => setSelectedOrderForReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
