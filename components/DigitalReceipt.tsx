'use client';

import React, { useState, useEffect } from 'react';
import { Order, EstablishmentSettings } from '@/lib/supabase';
import { formatXof } from '@/lib/payment-gateway';
import {
  subscribeToSettings,
  DEFAULT_ESTABLISHMENT_SETTINGS,
} from '@/lib/db-service';
import {
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Copy,
  Check,
  Flame,
  ChefHat,
  ArrowRight,
  Phone,
} from 'lucide-react';

interface DigitalReceiptProps {
  order: Order;
  onTrackOrder?: () => void;
  onNewOrder?: () => void;
}

export function DigitalReceipt({ order, onTrackOrder, onNewOrder }: DigitalReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const totalFcfa = Math.round(order.total);
  const formattedDate = order.paymentDate
    ? new Date(order.paymentDate).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const receiptNum = order.receiptNumber || `REC-TMS-2026-${order.id ? order.id.slice(0, 6).toUpperCase() : '001'}`;
  const orderRef = `#TMS-${order.id ? order.id.slice(0, 7).toUpperCase() : 'NOUVEAU'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`${receiptNum} - ${orderRef}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*REÇU NUMÉRIQUE ${settings.nomEtablissement.toUpperCase()}*\n` +
      `Référence : ${orderRef}\n` +
      `N° Reçu : ${receiptNum}\n` +
      `Client : ${order.customerName}\n` +
      `Mode : ${order.consumptionMode === 'sur_place' ? 'Sur place (' + (order.tableNumber || 'Salle') + ')' : order.consumptionMode === 'a_emporter' ? 'À emporter' : 'Livraison'}\n` +
      `Paiement : VALIDÉ (${order.paymentProvider === 'fedapay' ? 'FedaPay Mobile Money/Carte' : order.paymentProvider === 'kkiapay' ? 'KKiaPay Mobile Money/Carte' : 'Règlement Caisse'})\n` +
      `Total réglé : ${formatXof(totalFcfa)}\n` +
      `Statut : Transmis en cuisine & caisse`
    );
    const cleanNum = settings.whatsappOfficiel?.replace(/[^0-9]/g, '');
    const url = cleanNum ? `https://wa.me/${cleanNum}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Printable Receipt Container */}
      <div
        id="official-digital-receipt"
        className="bg-[#0e0e12] border-2 border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 text-zinc-100 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-black"
      >
        {/* Top Watermark Badge */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-white/10 relative">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7D0A1C] to-[#3B040B] border border-[#D4AF37] mb-3 shadow-lg">
            <span className="font-serif font-black text-2xl text-[#D4AF37]">T</span>
          </div>
          <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-widest uppercase">
            {settings.nomEtablissement}
          </h2>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mt-0.5">
            Café • Bar d&apos;Auteur • Grillades Braisées
          </p>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
            {settings.adresse}
          </p>
          <p className="text-[11px] text-zinc-400 font-mono">
            Tél : {settings.telephone}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Paiement Validé & Sécurisé</span>
          </div>
        </div>

        {/* Receipt Metas */}
        <div className="py-4 border-b border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Reçu N°</span>
            <span className="font-mono font-bold text-white text-xs">{receiptNum}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Date & Heure</span>
            <span className="font-mono text-zinc-200 text-xs">{formattedDate}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Client</span>
            <span className="font-medium text-white">{order.customerName}</span>
            {order.customerPhone && (
              <span className="block text-zinc-400 font-mono text-[11px]">{order.customerPhone}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Service</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#D4AF37]">
              {order.consumptionMode === 'sur_place' && <UtensilsCrossed className="h-3 w-3" />}
              {order.consumptionMode === 'a_emporter' && <ShoppingBag className="h-3 w-3" />}
              {order.consumptionMode === 'livraison' && <Bike className="h-3 w-3" />}
              <span>
                {order.consumptionMode === 'sur_place' && `Sur place • ${order.tableNumber || 'Salle'}`}
                {order.consumptionMode === 'a_emporter' && `À emporter (${order.pickupTime || 'Dès que possible'})`}
                {order.consumptionMode === 'livraison' && 'Livraison Express'}
              </span>
            </span>
          </div>
        </div>

        {/* Payment Transaction Details */}
        <div className="py-3 border-b border-white/10 bg-white/5 -mx-6 sm:-mx-8 px-6 sm:px-8 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {order.paymentMethod === 'mobile_money' ? (
              <Smartphone className="h-4 w-4 text-[#D4AF37]" />
            ) : (
              <CreditCard className="h-4 w-4 text-[#D4AF37]" />
            )}
            <span className="text-zinc-300 font-medium">
              Mode :{' '}
              <strong className="text-white">
                {order.paymentProvider === 'fedapay' && 'FedaPay Mobile Money / Carte'}
                {order.paymentProvider === 'kkiapay' && 'KKiaPay Mobile Money / Carte'}
                {(order.paymentProvider === 'sur_place' || !order.paymentProvider) && 'Paiement au restaurant / Sur place'}
              </strong>
            </span>
          </div>
          {order.paymentReference && (
            <div className="font-mono text-[11px] text-zinc-400">
              Réf Trans : <span className="text-white font-bold">{order.paymentReference}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="py-4 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
            Détail des consommations
          </div>
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#D4AF37]">{item.quantity}×</span>
                    <span>{item.nom}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-zinc-400 italic pl-6">
                      ↳ {item.notes}
                    </p>
                  )}
                  <span className="text-[10px] text-zinc-400 pl-6">
                    {formatXof(item.prix)} / unité
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-white">
                    {formatXof(item.prix * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Totals */}
        <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Sous-total articles :</span>
            <span className="font-mono text-zinc-300">{formatXof(order.items.reduce((s, i) => s + i.prix * i.quantity, 0))}</span>
          </div>
          {order.consumptionMode === 'livraison' && (
            <div className="flex justify-between text-zinc-400">
              <span>Frais de livraison :</span>
              <span className="font-mono text-zinc-300">1 500 FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-400">
            <span>TVA incluse (18%) :</span>
            <span className="font-mono text-zinc-300">{formatXof(Math.round(totalFcfa * 0.18))}</span>
          </div>

          {/* Grand Total Row */}
          <div className="pt-3 border-t border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#7D0A1C]/20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 rounded-2xl">
            <div>
              <span className="text-xs uppercase font-serif font-bold text-[#D4AF37] block">
                Total Réglé (TTC)
              </span>
              <span className="text-[10px] text-zinc-400">Transaction acquittée avec succès</span>
            </div>
            <div className="sm:text-right">
              <div className="font-serif font-black text-2xl text-[#D4AF37] font-mono">
                {formatXof(totalFcfa)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Verification Seal */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-white p-1.5 flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" className="h-full w-full text-black fill-current">
                <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm9-2h7v7h-7V2zm2 2v3h3V4h-3zM2 13h7v7H2v-7zm2 2v3h3v-3H4zm11 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm-7 2h2v2h-2v-2zm0-4h2v2h-2v-2z" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>QR Code d&apos;Authentification Officiel</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Ticket certifié TIMES • Sauvegardé dans Supabase PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors border border-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copied ? 'Copié !' : 'Copier Réf.'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
          >
            <Printer className="h-4 w-4 text-[#D4AF37]" />
            <span>Imprimer le reçu</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold transition-colors"
          >
            <Share2 className="h-4 w-4 text-emerald-400" />
            <span>Envoyer sur WhatsApp</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onTrackOrder && (
            <button
              onClick={onTrackOrder}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-white text-xs font-bold shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32] transition-colors"
            >
              <Flame className="h-4 w-4 text-[#D4AF37]" />
              <span>Suivre la préparation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {onNewOrder && (
            <button
              onClick={onNewOrder}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors"
            >
              Nouvelle commande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
