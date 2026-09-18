'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  CreditCard,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  UtensilsCrossed,
  Layers,
  Coffee,
  Wine,
  Flame,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Order, OrderItem } from '@/lib/supabase';

interface AdminDashboardProps {
  orders: Order[];
  onViewReceipt: (order: Order) => void;
}

const formatFcfa = (amount: number) => {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} FCFA`;
};

const COLORS = ['#D4AF37', '#7D0A1C', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export function AdminDashboard({ orders, onViewReceipt }: AdminDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'caisse'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'sur_place' | 'a_emporter' | 'livraison'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Current dates for calculations
  const { now, startOfToday, sevenDaysAgo, startOfMonth } = useMemo(() => {
    const d = new Date();
    return {
      now: d,
      startOfToday: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
      sevenDaysAgo: new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000).getTime(),
      startOfMonth: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
    };
  }, []);

  // 1. Calculations: Total Revenue & KPIs
  const {
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    paidOrdersCount,
    averageBasket,
    revenueByMode,
    revenueByPayment,
    topSellingProducts,
    dailyRevenueData,
  } = useMemo(() => {
    let totRev = 0;
    let tdRev = 0;
    let wkRev = 0;
    let moRev = 0;
    let validOrdersCount = 0;

    const modeTotals = {
      sur_place: 0,
      a_emporter: 0,
      livraison: 0,
    };

    const paymentTotals: Record<string, number> = {
      online: 0, // FedaPay / KKiaPay
      caisse: 0, // En espèces / Carte sur place
    };

    const productSalesMap: Record<string, { nom: string; qty: number; revenue: number; categorie?: string }> = {};

    // Grouping for the 7-day revenue chart
    const daysMap: Record<string, { label: string; dateStr: string; timestamp: number; revenue: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      daysMap[key] = { label, dateStr: key, timestamp: d.getTime(), revenue: 0, count: 0 };
    }

    orders.forEach((order) => {
      // We count completed, ready, preparing or confirmed paid orders
      const isCancelled = order.status === 'annulee';
      if (isCancelled) return;

      const orderTime = new Date(order.createdAt).getTime();
      const amount = Number(order.total) || 0;

      totRev += amount;
      validOrdersCount++;

      if (orderTime >= startOfToday) {
        tdRev += amount;
      }
      if (orderTime >= sevenDaysAgo) {
        wkRev += amount;
      }
      if (orderTime >= startOfMonth) {
        moRev += amount;
      }

      // Mode breakdown
      if (order.consumptionMode in modeTotals) {
        modeTotals[order.consumptionMode] += amount;
      }

      // Payment breakdown
      if (order.paymentStatus === 'paye' || order.paymentProvider === 'fedapay' || order.paymentProvider === 'kkiapay') {
        paymentTotals.online += amount;
      } else {
        paymentTotals.caisse += amount;
      }

      // Daily chart aggregation
      const dayKey = order.createdAt.split('T')[0];
      if (daysMap[dayKey]) {
        daysMap[dayKey].revenue += amount;
        daysMap[dayKey].count += 1;
      }

      // Products breakdown
      if (Array.isArray(order.items)) {
        order.items.forEach((item: OrderItem) => {
          const itemKey = item.nom || 'Article inconnu';
          const qty = Number(item.quantity) || 1;
          const itemTotal = (Number(item.prix) || 0) * qty;

          if (!productSalesMap[itemKey]) {
            productSalesMap[itemKey] = {
              nom: itemKey,
              qty: 0,
              revenue: 0,
              categorie: item.categorie,
            };
          }
          productSalesMap[itemKey].qty += qty;
          productSalesMap[itemKey].revenue += itemTotal;
        });
      }
    });

    const avgBasket = validOrdersCount > 0 ? totRev / validOrdersCount : 0;

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const chartData = Object.values(daysMap).map((d) => ({
      name: d.label,
      revenue: Math.round(d.revenue * 100) / 100,
      commandes: d.count,
    }));

    return {
      totalRevenue: totRev,
      todayRevenue: tdRev,
      weekRevenue: wkRev,
      monthRevenue: moRev,
      paidOrdersCount: validOrdersCount,
      averageBasket: avgBasket,
      revenueByMode: [
        { name: 'Sur place', value: Math.round(modeTotals.sur_place * 100) / 100, color: '#D4AF37' },
        { name: 'À emporter', value: Math.round(modeTotals.a_emporter * 100) / 100, color: '#3B82F6' },
        { name: 'Livraison', value: Math.round(modeTotals.livraison * 100) / 100, color: '#10B981' },
      ],
      revenueByPayment: [
        { name: 'Mobile Money / Carte (En ligne)', value: Math.round(paymentTotals.online * 100) / 100, color: '#10B981' },
        { name: 'Règlement Caisse / Espèces', value: Math.round(paymentTotals.caisse * 100) / 100, color: '#D4AF37' },
      ],
      topSellingProducts: topProducts,
      dailyRevenueData: chartData,
    };
  }, [orders, startOfToday, sevenDaysAgo, startOfMonth, now]);

  // 2. Filter sales history for detailed table
  const filteredSalesHistory = useMemo(() => {
    return orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();

      // Time filter
      if (timeFilter === 'today' && orderTime < startOfToday) return false;
      if (timeFilter === 'week' && orderTime < sevenDaysAgo) return false;
      if (timeFilter === 'month' && orderTime < startOfMonth) return false;

      // Payment filter
      if (paymentFilter === 'paid' && order.paymentStatus !== 'paye') return false;
      if (paymentFilter === 'caisse' && order.paymentStatus === 'paye') return false;

      // Mode filter
      if (modeFilter !== 'all' && order.consumptionMode !== modeFilter) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = order.customerName?.toLowerCase().includes(q);
        const matchPhone = order.customerPhone?.toLowerCase().includes(q);
        const matchRef = order.paymentReference?.toLowerCase().includes(q) || order.id?.toLowerCase().includes(q);
        const matchReceipt = order.receiptNumber?.toLowerCase().includes(q);
        const matchItem = order.items?.some((i) => i.nom?.toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchRef && !matchReceipt && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [orders, timeFilter, paymentFilter, modeFilter, searchQuery, startOfToday, sevenDaysAgo, startOfMonth]);

  // 3. Export Sales History as CSV
  const handleExportCSV = () => {
    if (filteredSalesHistory.length === 0) return;

    const headers = [
      'Date et Heure',
      'N° Reçu / Réf',
      'Client',
      'Téléphone',
      'Mode Consommation',
      'Statut Paiement',
      'Opérateur Paiement',
      'Total (FCFA)',
      'Articles',
    ];

    const rows = filteredSalesHistory.map((order) => {
      const dateStr = new Date(order.createdAt).toLocaleString('fr-FR');
      const ref = order.receiptNumber || order.paymentReference || order.id || '';
      const client = `"${(order.customerName || '').replace(/"/g, '""')}"`;
      const phone = `"${order.customerPhone || ''}"`;
      const mode = order.consumptionMode === 'sur_place' ? 'Sur place' : order.consumptionMode === 'a_emporter' ? 'A emporter' : 'Livraison';
      const payStatus = order.paymentStatus === 'paye' ? 'Paye' : 'A la caisse';
      const provider = order.paymentProvider || 'Especes/Caisse';
      const totXof = Math.round(order.total);
      const itemsList = `"${order.items.map((i) => `${i.quantity}x ${i.nom}`).join(', ')}"`;

      return [dateStr, ref, client, phone, mode, payStatus, provider, totXof, itemsList].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ventes_times_cafe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span>Tableau de Bord & Ventes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Analyse financière en temps réel, indicateurs du chiffre d’affaires et historique certifié des transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredSalesHistory.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-white px-4 py-2.5 border border-white/15 transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-[#D4AF37]" />
          <span>Exporter les Ventes (CSV)</span>
        </button>
      </div>

      {/* 1. KEY FINANCIAL INDICATORS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total CA */}
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1A22] to-[#121216] p-6 shadow-xl relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Chiffre d’Affaires Total
            </span>
            <span className="p-2 rounded-xl bg-[#7D0A1C]/50 text-[#D4AF37] border border-[#D4AF37]/30">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="font-serif text-3xl font-extrabold text-[#D4AF37] tracking-tight">
            {formatFcfa(totalRevenue)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{paidOrdersCount} commandes traitées</span>
          </div>
        </div>

        {/* CA Aujourd'hui */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Ventes Aujourd’hui
            </span>
            <span className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="font-serif text-3xl font-extrabold text-white tracking-tight">
            {formatFcfa(todayRevenue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Depuis 00:00 (Journée en cours)
          </div>
        </div>

        {/* CA 7 Derniers Jours */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Ventes 7 Derniers Jours
            </span>
            <span className="p-2 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-500/30">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <div className="font-serif text-3xl font-extrabold text-white tracking-tight">
            {formatFcfa(weekRevenue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Ce mois : {formatFcfa(monthRevenue)}
          </div>
        </div>

        {/* Panier Moyen */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Panier Moyen
            </span>
            <span className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-500/30">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="font-serif text-3xl font-extrabold text-white tracking-tight">
            {formatFcfa(averageBasket)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Ticket moyen par commande
          </div>
        </div>
      </div>

      {/* 2. REVENUE GRAPHS & TOP SELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Évolution Journalière du Chiffre d'Affaires (Area Chart) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Évolution du Chiffre d’Affaires (7 Derniers Jours)
                </h3>
                <p className="text-[11px] text-zinc-400">Volume quotidien des ventes générées en FCFA</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7D0A1C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#71717A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272A' }}
                />
                <YAxis
                  stroke="#71717A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272A' }}
                  tickFormatter={(val) => `${val >= 1000 ? `${Math.round(val / 1000)}k` : val} F`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${formatFcfa(Number(value))}`, 'Chiffre d’affaires']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Mode de Consommation (Pie Chart) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Ventes par Canal
              </h3>
              <p className="text-[11px] text-zinc-400">Sur place, Emporter & Livraison</p>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {totalRevenue === 0 ? (
              <div className="text-center text-xs text-zinc-500">Aucune commande enregistrée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByMode}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {revenueByMode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${formatFcfa(Number(value))}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            {revenueByMode.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <div className="font-mono font-semibold text-white">
                  {formatFcfa(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TOP SELLING DISHES & PAYMENT METHODS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Palmarès des Ventes (Top Plats & Boissons)
              </h3>
              <p className="text-[11px] text-zinc-400">Articles les plus rentables et demandés</p>
            </div>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Aucune vente de plat encore enregistrée.
            </div>
          ) : (
            <div className="space-y-3">
              {topSellingProducts.map((prod, idx) => (
                <div
                  key={prod.nom}
                  className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#7D0A1C]/40 text-[#D4AF37] font-mono text-xs font-bold border border-[#D4AF37]/30">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-xs sm:text-sm text-white truncate">
                        {prod.nom}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {prod.qty} unité{prod.qty > 1 ? 's vendues' : ' vendue'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs sm:text-sm font-bold text-[#D4AF37]">
                      {formatFcfa(prod.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Encaissements par Méthode */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Canaux d’Encaissement
              </h3>
              <p className="text-[11px] text-zinc-400">Mobile Money vs Caisse</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {revenueByPayment.map((pay) => {
              const percent = totalRevenue > 0 ? Math.round((pay.value / totalRevenue) * 100) : 0;
              return (
                <div key={pay.name} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{pay.name}</span>
                    <span className="font-mono font-bold text-[#D4AF37]">{formatFcfa(pay.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: pay.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{percent}% du volume total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. SALES HISTORY TABLE (HISTORIQUE DÉTAILLÉ DES VENTES) */}
      <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#D4AF37]" />
              <span>Historique Certifié des Ventes</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Journal exhaustif des commandes et paiements ({filteredSalesHistory.length} transaction{filteredSalesHistory.length > 1 ? 's' : ''})
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                timeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Tout ({orders.length})
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                timeFilter === 'today'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32]'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Aujourd’hui
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                timeFilter === 'week'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32]'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                timeFilter === 'month'
                  ? 'bg-[#7D0A1C] text-white border border-[#9E1B32]'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Ce mois
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Client, téléphone, reçu, plat..."
              className="w-full rounded-xl border border-white/10 bg-black/50 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Mode selector */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-zinc-300 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all">Tous les modes de service</option>
            <option value="sur_place">🍽️ Sur place uniquement</option>
            <option value="a_emporter">🛍️ À emporter uniquement</option>
            <option value="livraison">🛵 Livraison uniquement</option>
          </select>

          {/* Payment status selector */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-zinc-300 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all">Tous les statuts de paiement</option>
            <option value="paid">✅ Payé en ligne (FedaPay / KKiaPay)</option>
            <option value="caisse">💵 Règlement Caisse / Espèces</option>
          </select>
        </div>

        {/* Table */}
        {filteredSalesHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Aucune vente ne correspond aux critères sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/60 text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date & Heure</th>
                  <th className="py-3 px-4 font-semibold">N° Reçu / Réf</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Mode</th>
                  <th className="py-3 px-4 font-semibold">Articles</th>
                  <th className="py-3 px-4 font-semibold">Règlement</th>
                  <th className="py-3 px-4 font-semibold text-right">Montant</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSalesHistory.map((order) => {
                  const isPaid = order.paymentStatus === 'paye';
                  const receiptLabel = order.receiptNumber || `CMD-${(order.id || '').substring(0, 6).toUpperCase()}`;

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-[#D4AF37]">
                        {receiptLabel}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{order.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.consumptionMode === 'sur_place' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
                            🍽️ Sur place ({order.tableNumber || 'Salle'})
                          </span>
                        )}
                        {order.consumptionMode === 'a_emporter' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/40 text-blue-300 border border-blue-500/30">
                            🛍️ À emporter
                          </span>
                        )}
                        {order.consumptionMode === 'livraison' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                            🛵 Livraison
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-zinc-300 text-[11px]">
                          {order.items?.map((i) => `${i.quantity}x ${i.nom}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Payé ({order.paymentProvider === 'fedapay' ? 'FedaPay' : 'KKiaPay'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                            <span>Caisse / Espèces</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-[#D4AF37]">
                          {formatFcfa(order.total)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-white/10 transition-colors text-[11px] font-medium"
                          title="Consulter et imprimer le reçu officiel"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Reçu</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
