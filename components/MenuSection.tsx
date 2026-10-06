'use client';

import React, { useState, useEffect } from 'react';
import { Product, Order } from '@/lib/supabase';
import { subscribeToProducts, seedInitialProductsIfEmpty, DEFAULT_INITIAL_PRODUCTS } from '@/lib/db-service';
import { OrderModal, CartItem } from './OrderModal';
import {
  UtensilsCrossed,
  Coffee,
  GlassWater,
  Flame,
  CakeSlice,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Search,
  Bike,
  Lock,
  Clock,
  Eye,
  ChefHat,
  Salad,
  Soup,
  Pizza,
  Sandwich,
  Drumstick,
  Fish,
  Globe,
  Layers,
  CupSoda,
  Wine,
} from 'lucide-react';
import Link from 'next/link';

export const CATEGORY_LABELS: Record<string, string> = {
  'petit-dejeuner': 'Petit-Déjeuner',
  'entrees-salades': 'Entrées & Salades',
  'soupes-potages': 'Soupes & Potages',
  'pizzas': 'Pizzas',
  'pastas': 'Pastas',
  'burgers-sandwichs': 'Burgers & Sandwichs',
  'specialites-libanaises': 'Spécialités Libanaises',
  'viandes-rouges': 'Viandes Rouges',
  'poulets': 'Poulets',
  'poissons-crustaces': 'Poissons & Crustacés',
  'specialites-africaines': 'Spécialités Africaines',
  'specialites-chinoises': 'Spécialités Chinoises',
  'accompagnements': 'Accompagnements',
  'desserts': 'Desserts',
  'boissons-non-alcoolisees': 'Boissons Sans Alcool',
  'boissons-alcoolisees': 'Boissons Alcoolisées',
  'cafe': 'Côté Café',
  'bar': 'Côté Bar',
  'grill': 'Côté Grill',
  'dessert': 'Desserts',
};

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all-plats');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active placed order tracking
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Initialize and subscribe to Supabase products
  useEffect(() => {
    // Attempt auto-seed if first time
    seedInitialProductsIfEmpty().catch(() => {});

    const unsubscribe = subscribeToProducts((items) => {
      if (items.length > 0) {
        setProducts(items);
      } else {
        // Fallback to default items representation with temporary IDs
        setProducts(
          DEFAULT_INITIAL_PRODUCTS.map((p, idx) => ({
            ...p,
            id: `default-${idx}`,
          }))
        );
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Top-level gastronomic courses (Strict universal order)
  const GASTRONOMIC_GROUPS = [
    { id: 'all', label: 'Toute la Carte', icon: UtensilsCrossed },
    { id: 'petit-dejeuner', label: 'Petit-Déjeuner', icon: Coffee },
    { id: 'entrees-salades', label: 'Entrées & Salades', icon: Salad },
    { id: 'soupes-potages', label: 'Soupes & Potages', icon: Soup },
    { id: 'plats-principaux', label: 'Plats Principaux', icon: Flame, isGroup: true },
    { id: 'accompagnements', label: 'Accompagnements', icon: Layers },
    { id: 'desserts', label: 'Desserts', icon: CakeSlice },
    { id: 'boissons-non-alcoolisees', label: 'Boissons Sans Alcool', icon: CupSoda },
    { id: 'boissons-alcoolisees', label: 'Boissons Alcoolisées', icon: Wine },
  ];

  // Sub-categories under Plats Principaux
  const MAIN_DISH_SUBCATEGORIES = [
    { id: 'all-plats', label: 'Tous les Plats', icon: UtensilsCrossed },
    { id: 'pizzas', label: 'Pizzas', icon: Pizza },
    { id: 'pastas', label: 'Pastas', icon: UtensilsCrossed },
    { id: 'burgers-sandwichs', label: 'Burgers & Sandwichs', icon: Sandwich },
    { id: 'specialites-libanaises', label: 'Spécialités Libanaises', icon: Sparkles },
    { id: 'viandes-rouges', label: 'Viandes Rouges', icon: Flame },
    { id: 'poulets', label: 'Poulets', icon: Drumstick },
    { id: 'poissons-crustaces', label: 'Poissons & Crustacés', icon: Fish },
    { id: 'specialites-africaines', label: 'Spécialités Africaines', icon: Globe },
    { id: 'specialites-chinoises', label: 'Spécialités Chinoises', icon: ChefHat },
  ];

  const isItemInActiveCategory = (itemCategory: string) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'plats-principaux') {
      if (activeSubCategory !== 'all-plats') {
        return itemCategory === activeSubCategory;
      }
      return [
        'pizzas',
        'pastas',
        'burgers-sandwichs',
        'specialites-libanaises',
        'viandes-rouges',
        'poulets',
        'poissons-crustaces',
        'specialites-africaines',
        'specialites-chinoises',
        'grill',
      ].includes(itemCategory);
    }
    if (activeCategory === 'petit-dejeuner') {
      return itemCategory === 'petit-dejeuner' || itemCategory === 'cafe';
    }
    if (activeCategory === 'desserts') {
      return itemCategory === 'desserts' || itemCategory === 'dessert';
    }
    if (activeCategory === 'boissons-non-alcoolisees') {
      return itemCategory === 'boissons-non-alcoolisees';
    }
    if (activeCategory === 'boissons-alcoolisees') {
      return itemCategory === 'boissons-alcoolisees' || itemCategory === 'bar';
    }
    return itemCategory === activeCategory;
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    if (categoryId === 'plats-principaux') {
      return products.filter((p) =>
        [
          'pizzas',
          'pastas',
          'burgers-sandwichs',
          'specialites-libanaises',
          'viandes-rouges',
          'poulets',
          'poissons-crustaces',
          'specialites-africaines',
          'specialites-chinoises',
          'grill',
        ].includes(p.categorie)
      ).length;
    }
    if (categoryId === 'petit-dejeuner') {
      return products.filter((p) => p.categorie === 'petit-dejeuner' || p.categorie === 'cafe').length;
    }
    if (categoryId === 'desserts') {
      return products.filter((p) => p.categorie === 'desserts' || p.categorie === 'dessert').length;
    }
    if (categoryId === 'boissons-non-alcoolisees') {
      return products.filter((p) => p.categorie === 'boissons-non-alcoolisees').length;
    }
    if (categoryId === 'boissons-alcoolisees') {
      return products.filter((p) => p.categorie === 'boissons-alcoolisees' || p.categorie === 'bar').length;
    }
    return products.filter((p) => p.categorie === categoryId).length;
  };

  // Filtering by category and search
  const filteredItems = products.filter((item) => {
    const matchCategory = isItemInActiveCategory(item.categorie);
    const matchSearch =
      searchQuery.trim() === '' ||
      String(item.nom || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && String(item.description).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tag &&
        (Array.isArray(item.tag)
          ? item.tag.some((t: string) => String(t).toLowerCase().includes(searchQuery.toLowerCase()))
          : String(item.tag).toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

  const addToCart = (product: Product) => {
    if (product.dispo === false) return;
    setCart((prev) => {
      const prodKey = product.id || product.nom;
      const existing = prev.find((item) => (item.product.id || item.product.nom) === prodKey);
      if (existing) {
        return prev.map((item) =>
          (item.product.id || item.product.nom) === prodKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if ((item.product.id || item.product.nom) === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => (item.product.id || item.product.nom) !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);

  return (
    <section id="carte" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#D4AF37] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Vue Client • Carte Dynamique & Panier
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Une Carte Signée Par Nos Artisans
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Composez votre commande en temps réel avec nos viandes braisées, cafés de spécialité et cocktails signatures.
          </p>

          {/* Modes de consommation pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-zinc-300">
              <UtensilsCrossed className="h-3.5 w-3.5 text-[#D4AF37]" />
              <strong>Sur place</strong> (Service à table & Bar)
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-zinc-300">
              <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37]" />
              <strong>À emporter</strong> (Retrait express)
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-zinc-300">
              <Bike className="h-3.5 w-3.5 text-[#D4AF37]" />
              <strong>Livraison</strong> (À domicile ou bureau)
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <Link
              href="/cuisine"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7D0A1C]/20 hover:bg-[#7D0A1C]/40 text-[11px] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors"
            >
              <ChefHat className="h-3 w-3 text-[#D4AF37]" />
              <span>Espace Cuisine (Terminal KDS en direct)</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-[#7D0A1C]/30 text-[11px] text-zinc-400 hover:text-[#D4AF37] border border-white/10 transition-colors"
            >
              <Lock className="h-3 w-3 text-[#D4AF37]" />
              <span>Gérer les articles & commandes (Espace Admin)</span>
            </Link>
          </div>
        </div>

        {/* BANNIÈRE DE SUIVI SI COMMANDE EN COURS */}
        {lastPlacedOrder && (
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#170509] via-[#1F080D] to-[#121216] border-2 border-[#D4AF37] p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C] border border-[#D4AF37] text-[#D4AF37]">
                <Clock className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-[#D4AF37] animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#7D0A1C] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/40">
                    Commande en cours
                  </span>
                  <span className="font-mono text-xs text-zinc-300">
                    #TMS-{lastPlacedOrder.id?.slice(0, 7).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 mt-1">
                  {lastPlacedOrder.consumptionMode === 'sur_place' && `Sur place • ${lastPlacedOrder.tableNumber || 'Salle'}`}
                  {lastPlacedOrder.consumptionMode === 'a_emporter' && `À emporter • ${lastPlacedOrder.pickupTime || 'Dès que possible'}`}
                  {lastPlacedOrder.consumptionMode === 'livraison' && `Livraison • ${lastPlacedOrder.deliveryAddress}`}
                  {' • '}
                  <strong className="text-[#D4AF37] font-mono">{new Intl.NumberFormat('fr-FR').format(Math.round(lastPlacedOrder.total))} FCFA</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-4 py-2 text-xs font-semibold text-white border border-[#9E1B32] shadow-md transition-colors shrink-0"
            >
              <Eye className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Voir le statut en direct</span>
            </button>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat, burger, cocktail, café..."
              className="w-full rounded-2xl border border-white/10 bg-[#121216] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Universal Gastronomic Course Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {GASTRONOMIC_GROUPS.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = getCategoryCount(cat.id);

              return (
                <button
                  key={cat.id}
                  id={`tab-menu-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'plats-principaux') {
                      setActiveSubCategory('all-plats');
                    }
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7D0A1C] text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32]'
                      : 'bg-[#141418] text-zinc-300 hover:text-white border border-white/10 hover:border-[#D4AF37]/40'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                  <span>{cat.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono text-zinc-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-categories for Plats Principaux */}
          {activeCategory === 'plats-principaux' && (
            <div className="pt-2 pb-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 border-t border-white/5">
              <span className="text-[11px] text-zinc-400 font-semibold mr-1 flex items-center gap-1">
                <ChefHat className="h-3 w-3 text-[#D4AF37]" />
                Spécialités :
              </span>
              {MAIN_DISH_SUBCATEGORIES.map((sub) => {
                const isSubActive = activeSubCategory === sub.id;
                const subCount = sub.id === 'all-plats'
                  ? getCategoryCount('plats-principaux')
                  : products.filter((p) => p.categorie === sub.id).length;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCategory(sub.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      isSubActive
                        ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                        : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className={`text-[9px] px-1 py-0.1 rounded font-mono ${isSubActive ? 'bg-black/20 text-black' : 'bg-black/40 text-zinc-400'}`}>
                      {subCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            <div className="inline-block h-6 w-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Chargement de la carte en temps réel...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <p className="text-sm">Aucun produit ne correspond à votre recherche.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#D4AF37] underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => {
              const inCartItem = cart.find(
                (c) => (c.product.id || c.product.nom) === (item.id || item.nom)
              );
              const isAvailable = item.dispo !== false;

              return (
                <div
                  key={item.id || item.nom}
                  id={`menu-item-${item.id || item.nom}`}
                  className={`group relative rounded-2xl bg-[#121216] border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${
                    isAvailable
                      ? 'border-white/10 hover:border-[#D4AF37]/50'
                      : 'border-white/5 opacity-70 bg-black/40'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    {/* Item Image */}
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
                        alt={item.nom}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-bold text-amber-300 uppercase leading-tight">
                            En rupture
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                            {item.nom}
                          </h3>
                          {CATEGORY_LABELS[item.categorie] && (
                            <span className="inline-block rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                              {CATEGORY_LABELS[item.categorie]}
                            </span>
                          )}
                          {item.tag && (
                            <span className="inline-block rounded-full bg-[#7D0A1C]/30 border border-[#7D0A1C] px-2 py-0.5 text-[9px] font-semibold text-[#D4AF37]">
                              {Array.isArray(item.tag) ? item.tag.join(', ') : item.tag}
                            </span>
                          )}
                        </div>
                        {/* Price in Golden Yellow */}
                        <span className="font-serif text-base sm:text-lg font-bold text-[#D4AF37] shrink-0 font-mono">
                          {new Intl.NumberFormat('fr-FR').format(Math.round(item.prix))} FCFA
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {item.description || 'Préparation fraîche et recettes signatures TIMES.'}
                      </p>

                      {/* Options & Suppléments disponibles */}
                      {item.options && Array.isArray(item.options) && item.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.options.slice(0, 3).map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              {typeof opt === 'string' ? opt : (opt as { name?: string }).name || 'Option'}
                            </span>
                          ))}
                          {item.options.length > 3 && (
                            <span className="text-[9px] text-zinc-500 self-center">
                              +{item.options.length - 3} options
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {isAvailable ? 'Disponible immédiatement' : 'Momentanément indisponible'}
                    </span>

                    {/* Interactive Cart buttons */}
                    {isAvailable && inCartItem ? (
                      <div className="flex items-center gap-2 bg-[#7D0A1C] rounded-xl px-2 py-1 border border-[#9E1B32] shadow-md shadow-[#7D0A1C]/30">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id || item.nom, -1)}
                          className="p-1 text-white/80 hover:text-white"
                          title="Diminuer la quantité"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white px-1.5">
                          {inCartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id || item.nom, 1)}
                          className="p-1 text-white/80 hover:text-white"
                          title="Augmenter la quantité"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => addToCart(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          !isAvailable
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            : 'bg-white hover:bg-zinc-100 text-[#09090B] shadow hover:scale-105 active:scale-95'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5 text-[#7D0A1C]" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating / Sticky Cart Call-to-action */}
        {totalCartCount > 0 && (
          <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#7D0A1C] to-[#960D23] hover:from-[#960D23] hover:to-[#B3132B] text-white px-5 py-3.5 shadow-2xl shadow-black/90 border-2 border-[#D4AF37] transition-all hover:scale-105"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#09090B] font-mono text-[10px] font-extrabold">
                  {totalCartCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>Valider mon panier</span>
                </div>
                <div className="text-[11px] font-mono text-[#D4AF37] font-semibold">
                  {new Intl.NumberFormat('fr-FR').format(Math.round(totalCartPrice))} FCFA • Sur place, Emporter ou Livraison
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Order Modal Component with consumption mode and 'Commande en cours' tag */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={() => setCart([])}
          onOrderCompleted={(_id, orderData) => {
            setLastPlacedOrder(orderData);
          }}
        />

      </div>
    </section>
  );
}
