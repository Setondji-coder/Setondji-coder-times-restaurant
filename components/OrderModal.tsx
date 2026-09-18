'use client';

import React, { useState, useEffect } from 'react';
import { Product, ConsumptionMode, Order } from '@/lib/supabase';
import { createOrder, subscribeToOrder } from '@/lib/db-service';
import { PaymentSelector } from './PaymentSelector';
import { DigitalReceipt } from './DigitalReceipt';
import { PaymentSuccessResult, formatFcfa, formatXof } from '@/lib/payment-gateway';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Phone,
  User as UserIcon,
  AlertCircle,
  UtensilsCrossed,
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  Flame,
  ChevronRight,
  ArrowLeft,
  Receipt,
  Radio,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  FileText,
} from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCompleted?: (orderId: string, orderData: Order) => void;
}

export function OrderModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
}: OrderModalProps) {
  // Steps: 'form' -> 'payment' -> 'receipt' | 'tracking'
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'receipt' | 'tracking'>('form');

  // Consumption Mode
  const [consumptionMode, setConsumptionMode] = useState<ConsumptionMode>('sur_place');

  // Specific details per mode
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [pickupTime, setPickupTime] = useState('Dès que possible (~15-20 min)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Paris 8ème');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Customer contact info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active placed order
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderData, setActiveOrderData] = useState<Order | null>(null);

  // Real-time listener for placed order
  useEffect(() => {
    if (!activeOrderId) return;
    const unsub = subscribeToOrder(activeOrderId, (order) => {
      if (order) {
        setActiveOrderData(order);
      }
    });
    return () => unsub();
  }, [activeOrderId]);

  if (!isOpen) return null;

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.product.prix * item.quantity,
    0
  );
  const deliveryFee = consumptionMode === 'livraison' ? 1500 : 0;
  const finalTotal = itemsTotal + deliveryFee;

  // Step 1: Validate Form and proceed to Payment Selection
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Votre panier est vide.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }
    if (consumptionMode === 'livraison' && !deliveryAddress.trim()) {
      setError('Veuillez indiquer une adresse complète pour la livraison.');
      return;
    }
    if (!acceptedTerms) {
      setError("Veuillez cocher la case d'acceptation des Conditions Générales de Vente et de la Politique de Confidentialité pour continuer.");
      return;
    }

    setError(null);
    setCheckoutStep('payment');
  };

  // Step 2: On Successful Payment with FedaPay or KKiaPay
  const handlePaymentSuccess = async (paymentResult: PaymentSuccessResult) => {
    try {
      setLoading(true);
      setError(null);

      const newOrderPayload: Omit<Order, 'id' | 'createdAt'> = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        consumptionMode,
        tableNumber: consumptionMode === 'sur_place' ? tableNumber.trim() : undefined,
        pickupTime: consumptionMode === 'a_emporter' ? pickupTime.trim() : undefined,
        deliveryAddress: consumptionMode === 'livraison' ? deliveryAddress.trim() : undefined,
        deliveryCity: consumptionMode === 'livraison' ? deliveryCity.trim() : undefined,
        deliveryNotes: consumptionMode === 'livraison' ? deliveryNotes.trim() : undefined,
        tableOrRoom: consumptionMode === 'sur_place' ? tableNumber.trim() : undefined,
        // Status 'Commande en cours' for immediate processing in cuisine & caisse
        status: 'Commande en cours',
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          id: c.product.id || c.product.nom,
          nom: c.product.nom,
          prix: c.product.prix,
          quantity: c.quantity,
          categorie: c.product.categorie,
        })),
        total: finalTotal,
        totalXof: paymentResult.amountFcfa,
        amountPaid: paymentResult.amountFcfa,
        currency: 'XOF',
        // Payment verification metadata
        paymentStatus: 'paye',
        paymentProvider: paymentResult.provider,
        paymentMethod: paymentResult.method,
        paymentReference: paymentResult.transactionId,
        paymentDate: paymentResult.date,
        receiptNumber: paymentResult.receiptNumber,
      };

      // Dispatches order to Supabase
      const orderId = await createOrder(newOrderPayload);

      const completedOrder: Order = {
        ...newOrderPayload,
        id: orderId,
        createdAt: new Date().toISOString(),
      };

      setActiveOrderId(orderId);
      setActiveOrderData(completedOrder);
      setCheckoutStep('receipt');
      onOrderCompleted?.(orderId, completedOrder);
      onClearCart();
    } catch (err: unknown) {
      console.error('Erreur enregistrement commande après paiement:', err);
      setError('Paiement validé mais erreur lors de l’enregistrement. Veuillez contacter le restaurant.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveOrderId(null);
    setActiveOrderData(null);
    setError(null);
    setCheckoutStep('form');
    onClose();
  };

  const handleStartNewOrder = () => {
    setActiveOrderId(null);
    setActiveOrderData(null);
    setError(null);
    setCheckoutStep('form');
  };

  return (
    <div
      id="order-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#121216] p-5 sm:p-7 shadow-2xl my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D0A1C] to-[#3E050E] border border-[#D4AF37]/50 text-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20">
              {activeOrderId ? (
                <Receipt className="h-5 w-5" />
              ) : (
                <ShoppingBag className="h-5 w-5" />
              )}
            </span>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                {checkoutStep === 'receipt'
                  ? 'Reçu Numérique Officiel'
                  : checkoutStep === 'tracking'
                  ? 'Suivi de Commande en Cuisine'
                  : checkoutStep === 'payment'
                  ? 'Paiement Mobile Money / Carte'
                  : 'Votre Panier Gourmand'}
              </h3>
              <p className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold">
                TIMES Café Bar & Grill
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher if order is completed */}
            {activeOrderId && activeOrderData && (
              <div className="hidden sm:flex items-center bg-black/60 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('receipt')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    checkoutStep === 'receipt'
                      ? 'bg-[#7D0A1C] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Reçu
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('tracking')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    checkoutStep === 'tracking'
                      ? 'bg-[#7D0A1C] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Suivi Cuisine
                </button>
              </div>
            )}

            <button
              onClick={handleClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VUE 1 : REÇU NUMÉRIQUE DYNAMIQUE VALIDÉ */}
        {/* ======================================================== */}
        {activeOrderId && activeOrderData && checkoutStep === 'receipt' ? (
          <div className="py-5 animate-in zoom-in-95 duration-200">
            {/* Tab switch for mobile */}
            <div className="flex sm:hidden items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setCheckoutStep('receipt')}
                className="px-3 py-1 rounded-full bg-[#7D0A1C] text-white text-xs font-semibold"
              >
                Reçu Numérique
              </button>
              <button
                type="button"
                onClick={() => setCheckoutStep('tracking')}
                className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs hover:text-white border border-white/10"
              >
                Suivi Cuisine (KDS)
              </button>
            </div>

            <DigitalReceipt
              order={activeOrderData}
              onTrackOrder={() => setCheckoutStep('tracking')}
              onNewOrder={handleStartNewOrder}
            />
          </div>
        ) : activeOrderId && activeOrderData && checkoutStep === 'tracking' ? (
          /* ======================================================== */
          /* VUE 2 : SUIVI EN DIRECT EN CUISINE / BARISTA */
          /* ======================================================== */
          <div className="py-6 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Mobile Tab switch */}
            <div className="flex sm:hidden items-center justify-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('receipt')}
                className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs hover:text-white border border-white/10"
              >
                Voir le Reçu
              </button>
              <button
                type="button"
                onClick={() => setCheckoutStep('tracking')}
                className="px-3 py-1 rounded-full bg-[#7D0A1C] text-white text-xs font-semibold"
              >
                Suivi Cuisine
              </button>
            </div>

            {/* Official Order in Progress Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7D0A1C]/30 border-2 border-[#D4AF37] px-4 py-1.5 shadow-xl shadow-[#7D0A1C]/40 mb-3 animate-pulse">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                <span className="text-xs sm:text-sm font-serif font-black uppercase tracking-widest text-[#D4AF37]">
                  {activeOrderData.status || 'Commande en cours'}
                </span>
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">
                Merci, {activeOrderData.customerName} !
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                Votre commande a été validée avec succès et transmise en direct au chef et au barista.
              </p>
            </div>

            {/* Tracking Card */}
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-mono">
                    Référence Commande
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#D4AF37]">
                    #TMS-{activeOrderId.slice(0, 7).toUpperCase()}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/15 px-3 py-1.5">
                  {activeOrderData.consumptionMode === 'sur_place' && (
                    <>
                      <UtensilsCrossed className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-white">
                        Sur place ({activeOrderData.tableNumber || 'Salle'})
                      </span>
                    </>
                  )}
                  {activeOrderData.consumptionMode === 'a_emporter' && (
                    <>
                      <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-white">
                        À emporter ({activeOrderData.pickupTime || 'Dès que possible'})
                      </span>
                    </>
                  )}
                  {activeOrderData.consumptionMode === 'livraison' && (
                    <>
                      <Bike className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                        Livraison ({activeOrderData.deliveryAddress})
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Timeline */}
              <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center justify-between">
                  <span>Progression en cuisine</span>
                  <span className="text-[#D4AF37] font-mono text-[11px]">Temps estimé : ~15 min</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-[#7D0A1C] border-2 border-[#D4AF37] text-white flex items-center justify-center font-bold mb-1 shadow-md shadow-[#7D0A1C]">
                      <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <span className="font-semibold text-[#D4AF37]">Reçue</span>
                    <span className="text-zinc-400 text-[9px]">Paiement validé</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold mb-1 ${
                      activeOrderData.status === 'en_preparation'
                        ? 'bg-[#7D0A1C] border-[#D4AF37] text-white animate-pulse'
                        : 'bg-zinc-800 border-white/20 text-zinc-400'
                    }`}>
                      <Flame className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="font-semibold text-zinc-200">Aux Braises</span>
                    <span className="text-zinc-500 text-[9px]">Préparation active</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold mb-1 ${
                      activeOrderData.status === 'prete' || activeOrderData.status === 'terminee'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-zinc-900 border-white/10 text-zinc-500'
                    }`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-zinc-400">
                      {activeOrderData.consumptionMode === 'sur_place'
                        ? 'Servi'
                        : activeOrderData.consumptionMode === 'a_emporter'
                        ? 'Prêt au comptoir'
                        : 'En livraison'}
                    </span>
                    <span className="text-zinc-500 text-[9px]">Dégustation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('receipt')}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-3 text-xs sm:text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
              >
                <Receipt className="h-4 w-4 text-[#D4AF37]" />
                <span>Voir mon Reçu Numérique</span>
              </button>
              <button
                type="button"
                onClick={handleStartNewOrder}
                className="flex-1 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-colors"
              >
                Nouvelle commande
              </button>
            </div>
          </div>
        ) : checkoutStep === 'payment' ? (
          /* ======================================================== */
          /* VUE 3 : GUICHET DE PAIEMENT SÉCURISÉ FEDAPAY & KKIAPAY */
          /* ======================================================== */
          <div className="py-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setCheckoutStep('form')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Modifier ma commande & coordonnées</span>
              </button>
              <span className="text-[10px] text-[#D4AF37] font-mono">
                Étape 2 sur 2
              </span>
            </div>

            {/* Customer Summary Mini Card */}
            <div className="rounded-xl bg-white/5 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-zinc-400">Titulaire : </span>
                <strong className="text-white">{customerName}</strong>
                <span className="text-zinc-400 ml-2 font-mono">({customerPhone})</span>
              </div>
              <div className="text-[#D4AF37] font-medium">
                {consumptionMode === 'sur_place'
                  ? `Sur place (${tableNumber})`
                  : consumptionMode === 'a_emporter'
                  ? 'À emporter'
                  : 'Livraison'}
              </div>
            </div>

            <PaymentSelector
              amountFcfa={finalTotal}
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail}
              orderDescription={`Commande TIMES Café Bar & Grill - ${consumptionMode}`}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => setCheckoutStep('form')}
            />
          </div>
        ) : cart.length === 0 ? (
          /* ======================================================== */
          /* VUE 4 : PANIER VIDE */
          /* ======================================================== */
          <div className="py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-500 mx-auto mb-3">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <p className="text-base text-zinc-200 font-semibold">Votre panier est vide</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Parcourez les catégories Café, Bar, Grill et Desserts pour composer votre commande.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-100 px-5 py-2.5 text-xs font-bold text-black transition-colors"
            >
              <span>Découvrir la carte</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* ======================================================== */
          /* VUE 5 : PANIER & COORDONNÉES (ÉTAPE 1) */
          /* ======================================================== */
          <form onSubmit={handleProceedToPayment} className="mt-5 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Mode de consommation */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                1. Choisissez votre Mode de Consommation *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Sur place */}
                <button
                  type="button"
                  onClick={() => setConsumptionMode('sur_place')}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                    consumptionMode === 'sur_place'
                      ? 'bg-[#7D0A1C]/30 border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-[#D4AF37]">
                      <UtensilsCrossed className="h-4 w-4" />
                    </span>
                    {consumptionMode === 'sur_place' && (
                      <span className="flex h-2 w-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">Sur place</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    En salle, terrasse ou bar
                  </span>
                </button>

                {/* 2. À emporter */}
                <button
                  type="button"
                  onClick={() => setConsumptionMode('a_emporter')}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                    consumptionMode === 'a_emporter'
                      ? 'bg-[#7D0A1C]/30 border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-[#D4AF37]">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    {consumptionMode === 'a_emporter' && (
                      <span className="flex h-2 w-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">À emporter</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    Retrait express au comptoir
                  </span>
                </button>

                {/* 3. Livraison */}
                <button
                  type="button"
                  onClick={() => setConsumptionMode('livraison')}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                    consumptionMode === 'livraison'
                      ? 'bg-[#7D0A1C]/30 border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-[#D4AF37]">
                      <Bike className="h-4 w-4" />
                    </span>
                    {consumptionMode === 'livraison' && (
                      <span className="flex h-2 w-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">Livraison</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    À domicile ou au bureau
                  </span>
                </button>
              </div>

              {/* Conditional options */}
              <div className="mt-3 p-3.5 rounded-2xl bg-black/50 border border-white/10">
                {consumptionMode === 'sur_place' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Numéro de table ou emplacement *
                      </span>
                      <span className="text-[10px] text-zinc-400">Indiqué sur votre table</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ex : Table 4, Au Bar, Terrasse 2..."
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="text-zinc-500">Suggestions :</span>
                      {['Table 1', 'Table 4', 'Au Bar', 'Terrasse', 'Salon VIP'].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setTableNumber(sug)}
                          className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-0.5 text-zinc-300 border border-white/10"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {consumptionMode === 'a_emporter' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      Horaire de retrait souhaité au comptoir *
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="Dès que possible (~15-20 min)"
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                )}

                {consumptionMode === 'livraison' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Adresse de livraison complète *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="12 Avenue Montaigne, Bât B"
                        className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="Ville / Code postal"
                        className="rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Digicode, Étage, Interphone..."
                        className="rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Liste des produits du panier */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                <span>2. Vos Articles Sélectionnés ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id || item.product.nom}
                    className="flex items-center justify-between gap-3 rounded-xl bg-black/40 border border-white/10 p-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
                          alt={item.product.nom}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-xs truncate">
                          {item.product.nom}
                        </div>
                        <div className="text-[11px] text-[#D4AF37] font-mono">
                          {formatFcfa(item.product.prix)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-lg border border-white/15 bg-white/5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id || item.product.nom, -1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id || item.product.nom, 1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id || item.product.nom)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Coordonnées client */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                3. Vos Coordonnées
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <UserIcon className="h-3 w-3 text-[#D4AF37]" />
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#D4AF37]" />
                    Numéro de Téléphone (Mobile Money) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+229 01 69 69 86 86"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-2.5">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions pour la cuisine ou allergies (ex : saignant, sans piment...)"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Sous-total articles :</span>
                <span className="font-mono text-zinc-300">{formatFcfa(itemsTotal)}</span>
              </div>
              {consumptionMode === 'livraison' && (
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Frais de livraison (Cotonou) :</span>
                  <span className="font-mono text-zinc-300">{formatFcfa(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 font-serif">
                <span className="text-sm font-semibold text-white">Total à régler :</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#D4AF37] font-mono">
                    {formatFcfa(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Conformité & Validation Expresse CGV / Confidentialité */}
            <div className={`rounded-2xl border p-3.5 space-y-2.5 transition-colors ${
              acceptedTerms 
                ? 'bg-black/60 border-white/15' 
                : 'bg-[#180509]/60 border-[#9E1B32]/60 hover:border-[#D4AF37]/50'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="checkout-accept-cgv"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked && error?.includes("Conditions")) {
                      setError(null);
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black text-[#7D0A1C] focus:ring-[#D4AF37] cursor-pointer accent-[#7D0A1C] shrink-0"
                />
                <div className="text-xs text-zinc-300 leading-snug">
                  <span>J&apos;accepte les </span>
                  <a
                    href="/cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#D4AF37] font-bold underline decoration-[#D4AF37]/40 hover:decoration-[#D4AF37] inline-flex items-center gap-0.5"
                  >
                    <span>Conditions Générales de Vente</span>
                    <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>
                  <span> et la </span>
                  <a
                    href="/confidentialite"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#D4AF37] font-bold underline decoration-[#D4AF37]/40 hover:decoration-[#D4AF37] inline-flex items-center gap-0.5"
                  >
                    <span>Politique de Confidentialité</span>
                    <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>
                  <span> de TIMES Café Bar & Grill.</span>
                </div>
              </label>

              {/* Règle d'annulation essentielle */}
              <div className="flex items-start gap-2 rounded-xl bg-black/40 border border-white/10 p-2.5 text-[11px] text-zinc-300">
                <AlertTriangle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="text-[#D4AF37] font-bold block mb-0.5">Règle d&apos;annulation des commandes :</span>
                  <span>
                    Impossible une fois le statut <strong>« En préparation »</strong> activé par la cuisine ou le bar (denrées engagées et cuissons minute au feu de bois).
                  </span>
                </div>
              </div>
            </div>

            {/* Proceed button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7D0A1C] to-[#960D23] hover:from-[#960D23] hover:to-[#B3132B] disabled:opacity-50 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all hover:scale-[1.01]"
              >
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <span>
                  Procéder au Règlement • {formatFcfa(finalTotal)}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <p className="mt-2 text-center text-[10px] text-zinc-400">
                Règlement au restaurant (sur place / livraison) ou via passerelles en ligne avec reçu numérique immédiat et transmission cuisine.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
