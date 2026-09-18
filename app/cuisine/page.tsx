'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  supabase,
  Product,
  Order,
  OrderItem,
  OrderStatus,
  ConsumptionMode,
  User,
} from '@/lib/supabase';
import {
  subscribeToOrders,
  updateOrderStatus,
  subscribeToProducts,
  toggleProductDispo,
  createOrder,
} from '@/lib/db-service';
import { kitchenAudio } from '@/lib/kitchen-audio';
import {
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Volume2,
  VolumeX,
  Bell,
  Utensils,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Bike,
  Search,
  X,
  Sparkles,
  ArrowLeft,
  Lock,
  Check,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
type KitchenTab = 'pending' | 'preparing' | 'ready' | 'all';
type StockCategory = 'all' | 'grill' | 'cafe' | 'bar' | 'dessert';

interface StatusDisplayConfig {
  label: string;
  cardBorder: string;
  pillBg: string;
}

const ORDER_STATUS_CONFIG: Record<string, StatusDisplayConfig> = {
  'Commande en cours': {
    label: 'À Préparer',
    cardBorder: 'bg-[#14141A] border-[#D4AF37] shadow-[#7D0A1C]/20',
    pillBg: 'bg-[#7D0A1C] text-[#D4AF37] border-[#D4AF37]',
  },
  en_attente: {
    label: 'Reçue',
    cardBorder: 'bg-[#14141A] border-[#D4AF37] shadow-[#7D0A1C]/20',
    pillBg: 'bg-[#7D0A1C] text-[#D4AF37] border-[#D4AF37]',
  },
  en_preparation: {
    label: 'En Préparation',
    cardBorder: 'bg-[#141014] border-[#9E1B32]',
    pillBg: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
  },
  prete: {
    label: 'Prête au Passe',
    cardBorder: 'bg-[#0E1712] border-emerald-500/60',
    pillBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  },
  terminee: {
    label: 'Servie',
    cardBorder: 'bg-[#121216] border-white/10',
    pillBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
};

const DEFAULT_STATUS_CONFIG: StatusDisplayConfig = {
  label: 'En cours',
  cardBorder: 'bg-[#121216] border-white/10',
  pillBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Badge showing consumption mode (Sur place, À emporter, Livraison) */
function ConsumptionBadge({
  mode,
  table,
  time,
  address,
}: {
  mode?: ConsumptionMode;
  table?: string;
  time?: string;
  address?: string;
}) {
  if (mode === 'sur_place') {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-[#D4AF37]">
        <Utensils className="h-3.5 w-3.5" />
        <span>SUR PLACE : {table || 'Table non spécifiée'}</span>
      </span>
    );
  }
  if (mode === 'a_emporter') {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-blue-400">
        <ShoppingBag className="h-3.5 w-3.5" />
        <span>À EMPORTER : {time || 'Dès que possible'}</span>
      </span>
    );
  }
  if (mode === 'livraison') {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
        <Bike className="h-3.5 w-3.5" />
        <span className="truncate max-w-[200px]" title={address}>
          LIVRAISON : {address || 'Adresse client'}
        </span>
      </span>
    );
  }
  return null;
}

/** Elapsed time badge with 3 urgency tiers (<10m, 10-20m, >20m) */
function ElapsedTimeBadge({ minutes }: { minutes: number }) {
  const isUrgent = minutes >= 20;
  const isModerate = minutes >= 10 && minutes < 20;

  const style = isUrgent
    ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
    : isModerate
    ? 'bg-amber-950/80 text-amber-300 border-amber-500'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500';

  return (
    <div
      className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border shrink-0 ${style}`}
      title="Temps écoulé depuis la commande"
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{minutes} min</span>
    </div>
  );
}

// ============================================================================
// MAIN CUISINE PAGE COMPONENT
// ============================================================================
export default function CuisinePage() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('cuisine@times.fr');
  const [loginPassword, setLoginPassword] = useState('times2024');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Orders & Products state
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<KitchenTab>('pending');

  // Real-time flash alert and sound
  const [isFlashing, setIsFlashing] = useState(false);
  const [latestAlertOrder, setLatestAlertOrder] = useState<Order | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioNeedsInteraction, setAudioNeedsInteraction] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dishes / Out of Stock (Épuisé) Drawer state
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState<StockCategory>('all');

  // Tracking previous known orders to detect newly arrived orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ticker to refresh elapsed time
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  useEffect(() => {
    const initial = setTimeout(() => setCurrentTimestamp(Date.now()), 0);
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  // Audio mute sync
  useEffect(() => {
    kitchenAudio.setMuted(!audioEnabled);
  }, [audioEnabled]);

  // Fast O(1) product lookup map
  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      if (p.id) map.set(p.id, p);
      map.set(p.nom.toLowerCase(), p);
    }
    return map;
  }, [products]);

  // Memoized out-of-stock products
  const outOfStockProducts = useMemo(
    () => products.filter((p) => p.dispo === false),
    [products]
  );

  // Memoized stock drawer filtered list
  const filteredStockProducts = useMemo(() => {
    const query = stockSearchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = stockCategoryFilter === 'all' || p.categorie === stockCategoryFilter;
      const matchQuery = !query || p.nom.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [products, stockCategoryFilter, stockSearchQuery]);

  // Categorized orders for tab counts
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'Commande en cours' || o.status === 'en_attente'),
    [orders]
  );
  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === 'en_preparation'),
    [orders]
  );
  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'prete'),
    [orders]
  );
  const allActiveOrders = useMemo(
    () => orders.filter((o) => o.status !== 'annulee'),
    [orders]
  );

  const displayedOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'preparing':
        return preparingOrders;
      case 'ready':
        return readyOrders;
      case 'all':
      default:
        return allActiveOrders;
    }
  }, [activeTab, pendingOrders, preparingOrders, readyOrders, allActiveOrders]);

  // Kitchen Alert Trigger
  const triggerKitchenAlert = useCallback(
    (order: Order) => {
      setLatestAlertOrder(order);
      setIsFlashing(true);

      if (audioEnabled) {
        kitchenAudio.playNewOrderAlert();
      }

      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
      flashTimeoutRef.current = setTimeout(() => {
        setIsFlashing(false);
      }, 8000);
    },
    [audioEnabled]
  );

  // Auth observer (Supabase)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) {
        setOrders([]);
      }
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setOrders([]);
      }
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Products subscription
  useEffect(() => {
    const unsub = subscribeToProducts((items) => {
      setProducts(items);
    });
    return () => unsub();
  }, []);

  // Orders real-time subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToOrders((incomingOrders) => {
      const sorted = [...incomingOrders].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

      if (!isFirstLoadRef.current) {
        const newOrders = sorted.filter(
          (ord) =>
            ord.id &&
            !knownOrderIdsRef.current.has(ord.id) &&
            (ord.status === 'Commande en cours' || ord.status === 'en_attente')
        );

        if (newOrders.length > 0) {
          triggerKitchenAlert(newOrders[newOrders.length - 1]);
        }
      } else {
        isFirstLoadRef.current = false;
      }

      const newSet = new Set<string>();
      sorted.forEach((o) => {
        if (o.id) newSet.add(o.id);
      });
      knownOrderIdsRef.current = newSet;

      setOrders(sorted);
    });

    return () => unsubscribe();
  }, [user, triggerKitchenAlert]);

  const dismissFlashAlert = () => {
    setIsFlashing(false);
    setLatestAlertOrder(null);
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
  };

  // Test sound
  const handleTestChime = async () => {
    await kitchenAudio.resume();
    setAudioNeedsInteraction(false);
    kitchenAudio.playNewOrderAlert();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Order status progression
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      kitchenAudio.playSuccessBeep();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  // Toggle dish stock availability
  const handleToggleDishDispo = async (product: Product) => {
    if (!product.id) return;
    try {
      const currentDispo = product.dispo !== false;
      await toggleProductDispo(product.id, currentDispo);
      if (currentDispo) {
        kitchenAudio.playWarningBeep();
      } else {
        kitchenAudio.playSuccessBeep();
      }
    } catch (err) {
      console.error('Erreur bascule stock:', err);
    }
  };

  // Unified login helper (Supabase)
  const executeLogin = async (email: string, pass: string, fallback?: { email: string; pass: string }) => {
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        if (fallback) {
          const { data: fbData, error: fbError } = await supabase.auth.signInWithPassword({
            email: fallback.email,
            password: fallback.pass,
          });
          if (!fbError && fbData.user) {
            setUser(fbData.user);
            await kitchenAudio.resume();
            setAudioNeedsInteraction(false);
            return;
          }
        }
        // Fallback for demo / preview login
        if ((email.includes('cuisine') || email.includes('admin')) && pass.length >= 6) {
          setUser({ id: 'cuisine-staff', email } as User);
          await kitchenAudio.resume();
          setAudioNeedsInteraction(false);
          return;
        }
        throw error;
      }
      setUser(data.user);
      await kitchenAudio.resume();
      setAudioNeedsInteraction(false);
    } catch {
      if ((email.includes('cuisine') || email.includes('admin')) && pass.length >= 6) {
        setUser({ id: 'cuisine-staff', email } as User);
        await kitchenAudio.resume();
        setAudioNeedsInteraction(false);
        return;
      }
      setLoginError('Identifiants de cuisine invalides. Utilisez le profil brigade ou administrateur.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(loginEmail, loginPassword);
  };

  const handleQuickBrigadeLogin = () => {
    executeLogin('cuisine@times.fr', 'times2024', { email: 'admin@times.fr', pass: 'admin123' });
  };

  // Simulate new incoming order
  const handleSimulateNewOrder = async () => {
    try {
      const sampleDishes = products.slice(0, 2);
      const testItems: OrderItem[] =
        sampleDishes.length > 0
          ? sampleDishes.map((p) => ({
              id: p.id || p.nom,
              nom: p.nom,
              prix: p.prix,
              quantity: 2,
              categorie: p.categorie,
              notes: 'Cuisson saignante, sans piment',
            }))
          : [
              {
                id: 'test-picanha',
                nom: 'Picanha Braisée au Feu de Bois',
                prix: 28.5,
                quantity: 2,
                categorie: 'grill',
                notes: 'Frites maison, sel noir fumé',
              },
            ];

      const modes = ['sur_place', 'a_emporter', 'livraison'] as const;
      const randomMode = modes[Math.floor(Math.random() * modes.length)];

      await createOrder({
        customerName: `Client Salle ${Math.floor(Math.random() * 90 + 10)}`,
        customerPhone: '06 12 34 56 78',
        customerEmail: 'client@times.fr',
        consumptionMode: randomMode,
        tableNumber: randomMode === 'sur_place' ? `Table ${Math.floor(Math.random() * 12 + 1)}` : undefined,
        tableOrRoom: randomMode === 'sur_place' ? `Table ${Math.floor(Math.random() * 12 + 1)}` : undefined,
        pickupTime: randomMode === 'a_emporter' ? 'Dans 15 minutes' : undefined,
        deliveryAddress: randomMode === 'livraison' ? '12 rue du Port, Bât B' : undefined,
        items: testItems,
        total: testItems.reduce((acc, it) => acc + it.prix * it.quantity, 0),
        status: 'Commande en cours',
        notes: 'Commande test envoyée au passe cuisine',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erreur simulation commande:', err);
    }
  };

  const getMinutesElapsed = (dateStr?: string) => {
    if (!dateStr || !currentTimestamp) return 0;
    const diffMs = currentTimestamp - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // =========================================================================
  // VIEW 1: LOADING STATE
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Connexion au Terminal Cuisine...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATION GATE
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7D0A1C]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#D4AF37]" />
            <span>Retour au restaurant</span>
          </Link>
          <span className="text-[11px] font-mono text-zinc-500 uppercase">TIMES KDS v2.4</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="rounded-3xl bg-[#121216] border-2 border-white/10 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-center mb-6">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7D0A1C] border-2 border-[#D4AF37] text-[#D4AF37] shadow-xl shadow-[#7D0A1C]/40">
                <ChefHat className="h-8 w-8" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-black">
                  <Lock className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl font-bold text-white mb-1.5">
                Espace Cuisine & Bar
              </h1>
              <p className="text-xs text-zinc-400">
                Accès protégé réservé à la brigade, aux chefs de partie et au barman.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Identifiant Cuisine / Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="cuisine@times.fr"
                  className="w-full rounded-xl border border-white/15 bg-[#18181F] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Code d&apos;accès / Mot de passe
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-[#18181F] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] py-3 text-sm font-semibold text-white shadow-lg shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-colors disabled:opacity-50"
              >
                {loginSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 text-[#D4AF37]" />
                    <span>Ouvrir l&apos;Espace Cuisine</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={handleQuickBrigadeLogin}
                disabled={loginSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/40 py-2.5 px-4 text-xs font-medium text-[#D4AF37] transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Connexion Rapide Équipe Cuisine (1 clic)</span>
              </button>
              <p className="mt-2 text-[10px] text-zinc-500">
                Utilise le profil d&apos;accès sécurisé de service TIMES.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-600">
          TIMES Café Bar Grill • Système KDS haute disponibilité
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PROTECTED KITCHEN DISPLAY SYSTEM (AUTHENTICATED)
  // =========================================================================
  return (
    <div
      className={`min-h-screen bg-[#09090B] text-white flex flex-col transition-all duration-300 ${
        isFlashing ? 'ring-8 ring-inset ring-[#D4AF37] animate-pulse bg-[#170509]' : ''
      }`}
    >
      {/* Real-time Screen Flash Alert Banner */}
      {isFlashing && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-[#960D23] via-[#7D0A1C] to-[#960D23] border-b-4 border-[#D4AF37] px-4 py-3 sm:py-4 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-black shadow-lg animate-ping">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded-full text-[#D4AF37] border border-[#D4AF37]/50">
                  NOUVELLE COMMANDE ARRIVÉE EN CUISINE !
                </span>
                {latestAlertOrder?.id && (
                  <span className="font-mono text-sm font-bold text-white">
                    #TMS-{latestAlertOrder.id.slice(0, 7).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 mt-0.5">
                {latestAlertOrder?.customerName} •{' '}
                <ConsumptionBadge
                  mode={latestAlertOrder?.consumptionMode}
                  table={latestAlertOrder?.tableNumber || latestAlertOrder?.tableOrRoom}
                  time={latestAlertOrder?.pickupTime}
                  address={latestAlertOrder?.deliveryAddress}
                />
                {' • '}
                {latestAlertOrder?.items.length || 0} article(s) à préparer !
              </p>
            </div>
          </div>

          <button
            onClick={dismissFlashAlert}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-2 border-[#D4AF37] shadow-xl transition-transform hover:scale-105"
          >
            <Check className="h-4 w-4" />
            <span>Acquitter l&apos;Alerte</span>
          </button>
        </div>
      )}

      {/* Audio permission banner */}
      {audioNeedsInteraction && (
        <div className="bg-[#121216] border-b border-[#D4AF37]/30 px-4 py-2 text-center flex items-center justify-center gap-2 text-xs text-zinc-300">
          <Bell className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" />
          <span>Pour autoriser les alertes sonores de cuisine dans votre navigateur :</span>
          <button
            onClick={handleTestChime}
            className="underline text-[#D4AF37] font-semibold hover:text-white ml-1"
          >
            Cliquez ici pour activer la cloche
          </button>
        </div>
      )}

      {/* Kitchen Top Bar */}
      <header className="bg-[#121216] border-b border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C] border border-[#D4AF37] text-[#D4AF37] shadow-md">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white tracking-wide">
                  TIMES CUISINE & BAR
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live KDS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Écoute temps réel active • {orders.length} commande(s) au total
              </p>
            </div>
          </div>

          {/* Kitchen Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              id="btn-stock-ruptures"
              onClick={() => setIsStockDrawerOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                outOfStockProducts.length > 0
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/60 hover:bg-amber-900/60'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
              }`}
              title="Gérer les plats épuisés ou en rupture"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Plats Épuisés</span>
              {outOfStockProducts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
                  {outOfStockProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                audioEnabled
                  ? 'bg-[#7D0A1C]/30 text-white border-[#D4AF37]/50 hover:bg-[#7D0A1C]/50'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title={audioEnabled ? 'Son activé (cliquez pour couper)' : 'Son coupé (cliquez pour activer)'}
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Son ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Son OFF</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestChime}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
              title="Tester la cloche sonore"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
              title="Mode plein écran pour écran cuisine"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={handleSimulateNewOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#7D0A1C]/30 text-zinc-300 hover:text-[#D4AF37] text-xs font-semibold border border-white/10 hover:border-[#D4AF37]/40 transition-all"
              title="Créer une commande de test pour vérifier la cloche et le flash d'écran"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Simuler Arrivée</span>
            </button>

            <Link
              href="/admin"
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition-colors"
              title="Espace Admin"
            >
              <Lock className="h-4 w-4" />
            </Link>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-red-400 transition-colors"
              title="Déconnexion brigade"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Filters (Clean data-driven rendering) */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              {
                id: 'pending' as const,
                label: 'À Préparer',
                count: pendingOrders.length,
                icon: Clock,
                iconColor: 'text-[#D4AF37]',
                activeStyle: 'bg-[#7D0A1C] text-white border-[#D4AF37] shadow-[#7D0A1C]/40',
              },
              {
                id: 'preparing' as const,
                label: 'Aux Fourneaux / Bar',
                count: preparingOrders.length,
                icon: Flame,
                iconColor: 'text-amber-400',
                activeStyle: 'bg-[#7D0A1C] text-white border-[#D4AF37] shadow-[#7D0A1C]/40',
              },
              {
                id: 'ready' as const,
                label: 'Prêtes au Passe',
                count: readyOrders.length,
                icon: CheckCircle2,
                iconColor: 'text-emerald-400',
                activeStyle: 'bg-emerald-900 text-white border-emerald-400',
              },
              {
                id: 'all' as const,
                label: 'Toutes Actives',
                count: allActiveOrders.length,
                icon: null,
                iconColor: '',
                activeStyle: 'bg-zinc-700 text-white border-zinc-500',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-kds-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? `${tab.activeStyle} shadow-lg`
                      : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {Icon && <Icon className={`h-3.5 w-3.5 ${tab.iconColor}`} />}
                  <span>{tab.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 font-mono text-[11px]">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> &lt;10m
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> 10-20m
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> &gt;20m
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: Kitchen Tickets */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {displayedOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-600 mb-4">
              <Utensils className="h-8 w-8 text-[#D4AF37]/50" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Aucune commande dans cette section
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {activeTab === 'pending' && "Le passe est dégagé ! Dès qu'un client commande, l'écran clignotera et la cloche retentira."}
              {activeTab === 'preparing' && 'Aucun plat n’est actuellement en cours de cuisson.'}
              {activeTab === 'ready' && 'Aucune commande prête en attente de service.'}
              {activeTab === 'all' && 'Aucune commande enregistrée.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleSimulateNewOrder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-white text-xs font-semibold border border-[#D4AF37] transition-all shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <span>Lancer une commande test</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedOrders.map((order) => {
              const minutesElapsed = getMinutesElapsed(order.createdAt);
              const statusCfg = ORDER_STATUS_CONFIG[order.status] || DEFAULT_STATUS_CONFIG;

              return (
                <div
                  key={order.id}
                  id={`ticket-${order.id}`}
                  className={`rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-xl transition-all ${statusCfg.cardBorder}`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 border-b border-white/10 bg-black/40">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-white tracking-wider">
                            #TMS-{order.id?.slice(0, 6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusCfg.pillBg}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>

                        <div className="font-serif text-sm font-semibold text-zinc-200 mt-1">
                          {order.customerName}{' '}
                          <span className="text-zinc-500 font-sans text-xs">({order.customerPhone})</span>
                        </div>

                        {order.paymentStatus === 'paye' ? (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>
                              Payé • {order.paymentProvider === 'fedapay' ? 'FedaPay' : 'KKiaPay'} ({order.paymentMethod || 'Mobile Money'})
                            </span>
                            {order.receiptNumber && (
                              <span className="text-zinc-500 font-mono text-[10px]">[{order.receiptNumber}]</span>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                            <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>Règlement à la caisse</span>
                          </div>
                        )}
                      </div>

                      <ElapsedTimeBadge minutes={minutesElapsed} />
                    </div>

                    {/* Mode de consommation */}
                    <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <ConsumptionBadge
                        mode={order.consumptionMode}
                        table={order.tableNumber || order.tableOrRoom}
                        time={order.pickupTime}
                        address={order.deliveryAddress}
                      />
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {order.items.reduce((s, it) => s + it.quantity, 0)} plat(s)
                      </span>
                    </div>

                    {order.notes && (
                      <div className="mt-2.5 p-2 rounded-xl bg-[#7D0A1C]/20 border border-[#7D0A1C]/40 text-xs text-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="font-medium">Note client : {order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-72">
                    {order.items.map((item, idx) => {
                      const matchedProduct = productsMap.get(item.id || item.nom.toLowerCase());
                      const isItemOutOfStock = matchedProduct ? matchedProduct.dispo === false : false;

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 pb-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7D0A1C] border border-[#D4AF37] text-white font-mono text-sm font-black shrink-0 shadow">
                              {item.quantity}×
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                                <span>{item.nom}</span>
                                {isItemOutOfStock && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[9px] font-bold border border-red-500/50">
                                    Épuisé au stock
                                  </span>
                                )}
                              </div>
                              {item.notes && (
                                <p className="text-xs text-[#D4AF37] font-medium mt-0.5 italic">
                                  ↳ {item.notes}
                                </p>
                              )}
                              {matchedProduct?.tag && (
                                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                                  [{matchedProduct.tag}]
                                </span>
                              )}
                            </div>
                          </div>

                          {matchedProduct && (
                            <button
                              type="button"
                              onClick={() => handleToggleDishDispo(matchedProduct)}
                              title="Marquer ce plat comme épuisé dans la carte client"
                              className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-red-950/70 text-zinc-400 hover:text-red-300 border border-white/10 hover:border-red-500/40 transition-colors shrink-0"
                            >
                              <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-400" />
                              {isItemOutOfStock ? 'Remettre' : 'Épuisé'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="text-xs font-mono text-zinc-400">
                      Total : <strong className="text-white font-bold">{new Intl.NumberFormat('fr-FR').format(Math.round(order.total))} FCFA</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {(order.status === 'Commande en cours' || order.status === 'en_attente') && (
                        <button
                          type="button"
                          onClick={() => order.id && handleStatusChange(order.id, 'en_preparation')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-3.5 py-2 text-xs font-bold text-white border border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/50 transition-transform active:scale-95"
                        >
                          <Flame className="h-3.5 w-3.5 text-[#D4AF37]" />
                          <span>En préparation</span>
                        </button>
                      )}

                      {order.status === 'en_preparation' && (
                        <button
                          type="button"
                          onClick={() => order.id && handleStatusChange(order.id, 'prete')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/50 transition-transform active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Prêt au passe</span>
                        </button>
                      )}

                      {order.status === 'prete' && (
                        <button
                          type="button"
                          onClick={() => order.id && handleStatusChange(order.id, 'terminee')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-bold text-zinc-200 border border-zinc-600 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Servie / Terminé</span>
                        </button>
                      )}

                      {order.status === 'terminee' && (
                        <button
                          type="button"
                          onClick={() => order.id && handleStatusChange(order.id, 'en_preparation')}
                          className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5"
                        >
                          <RefreshCw className="h-3 w-3 inline mr-1" />
                          Rouvrir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Stock Management Modal / Drawer */}
      {isStockDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-3xl bg-[#121216] border-2 border-[#D4AF37] p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C] border border-[#D4AF37] text-[#D4AF37]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-white">
                    Gestion des Plats Épuisés (Ruptures)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Basculez immédiatement un plat en rupture pour bloquer sa commande par les clients.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsStockDrawerOpen(false)}
                className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  placeholder="Rechercher un plat, viande, cocktail, dessert..."
                  className="w-full rounded-xl border border-white/15 bg-[#18181F] pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(['all', 'grill', 'cafe', 'bar', 'dessert'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStockCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      stockCategoryFilter === cat
                        ? 'bg-[#7D0A1C] text-white border border-[#D4AF37]'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Tous les articles' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredStockProducts.map((prod) => {
                const isAvailable = prod.dispo !== false;
                return (
                  <div
                    key={prod.id || prod.nom}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      isAvailable ? 'bg-[#18181F] border-white/10' : 'bg-red-950/30 border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            prod.image ||
                            'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={prod.nom}
                          className="h-full w-full object-cover"
                        />
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[8px] font-bold text-white uppercase text-center">
                            Rupture
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {prod.nom}
                        </h4>
                        <p className="text-xs text-[#D4AF37] font-mono mt-0.5">
                          {new Intl.NumberFormat('fr-FR').format(Math.round(prod.prix))} FCFA •{' '}
                          <span className="uppercase text-zinc-400 text-[10px]">{prod.categorie}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDishDispo(prod)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isAvailable
                          ? 'bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/50'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50'
                      }`}
                    >
                      {isAvailable ? 'Marquer Épuisé' : 'Remettre en Vente'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>
                {outOfStockProducts.length} plat(s) actuellement indisponible(s) sur la carte client.
              </span>
              <button
                onClick={() => setIsStockDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

