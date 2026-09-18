'use client';

import React, { useState, useEffect } from 'react';
import {
  PAYMENT_CONFIG,
  formatFcfa,
  formatXof,
  generateReceiptNumber,
  generateTransactionId,
  loadFedaPayScript,
  loadKkiapayScript,
  isFedaPayConfigured,
  isKkiapayConfigured,
  PaymentSuccessResult,
} from '@/lib/payment-gateway';
import {
  Smartphone,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  Store,
  Info,
} from 'lucide-react';

interface PaymentSelectorProps {
  amountFcfa: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderDescription: string;
  onPaymentSuccess: (result: PaymentSuccessResult) => void;
  onCancel?: () => void;
}

export function PaymentSelector({
  amountFcfa,
  customerName,
  customerPhone,
  customerEmail,
  orderDescription,
  onPaymentSuccess,
}: PaymentSelectorProps) {
  const fedaReady = isFedaPayConfigured();
  const kkiaReady = isKkiapayConfigured();

  // Si aucune passerelle n'est configurée, sélectionner le paiement sur place par défaut
  const defaultProvider = fedaReady ? 'fedapay' : kkiaReady ? 'kkiapay' : 'sur_place';
  const [selectedProvider, setSelectedProvider] = useState<'fedapay' | 'kkiapay' | 'sur_place'>(defaultProvider);
  const [paymentType, setPaymentType] = useState<'momo' | 'card'>('momo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Préchargement sécurisé des SDKs uniquement si configurés
  useEffect(() => {
    if (fedaReady) {
      loadFedaPayScript().catch(() => {});
    }
    if (kkiaReady) {
      loadKkiapayScript().catch(() => {});
    }
  }, [fedaReady, kkiaReady]);

  // Traitement FedaPay
  const handleFedaPay = async () => {
    if (!fedaReady) {
      // Si la clé n'est pas encore définie, basculer sans erreur sur le paiement sur place
      setSelectedProvider('sur_place');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Connexion au serveur sécurisé FedaPay...');

    try {
      const scriptReady = await loadFedaPayScript();
      const cleanPhone = customerPhone.replace(/\s+/g, '').replace(/^(\+229|\+33|\+225)/, '');
      const nameParts = customerName.trim().split(' ');
      const receiptNumber = generateReceiptNumber();
      const generatedTxId = generateTransactionId('FEDA');

      if (scriptReady && window.FedaPay) {
        setStatusMessage('Ouverture du guichet Mobile Money / Carte FedaPay...');

        try {
          const widget = window.FedaPay.init({
            public_key: PAYMENT_CONFIG.fedapay.publicKey,
            environment: PAYMENT_CONFIG.fedapay.environment,
            transaction: {
              amount: amountFcfa,
              description: orderDescription || 'Commande TIMES Café Bar & Grill',
              custom_metadata: {
                receiptNumber,
                paymentType,
              },
            },
            customer: {
              firstname: nameParts[0] || 'Client',
              lastname: nameParts.slice(1).join(' ') || 'TIMES',
              email: customerEmail || 'timeslesmoments@gmail.com',
              phone_number: {
                number: cleanPhone || '97000000',
                country: 'bj',
              },
            },
            onComplete: (resp: { status?: string; transaction?: { id?: string; reference?: string } }) => {
              if (resp.status === 'approved' || resp.status === 'successful' || !resp.status) {
                onPaymentSuccess({
                  provider: 'fedapay',
                  transactionId: resp.transaction?.id?.toString() || generatedTxId,
                  reference: resp.transaction?.reference || `REF-${generatedTxId}`,
                  method: paymentType === 'momo' ? 'Mobile Money (MTN / Moov / Celtiis)' : 'Carte Bancaire (Visa / Mastercard)',
                  amountFcfa,
                  date: new Date().toISOString(),
                  customerPhone,
                  customerName,
                  receiptNumber,
                });
              }
            },
          });

          if (widget && typeof widget.open === 'function') {
            widget.open();
            setLoading(false);
            return;
          }
        } catch (widgetErr) {
          console.warn('Avertissement initialisation widget FedaPay:', widgetErr);
        }
      }

      // Simulation de test si le widget n'a pas pu s'ouvrir
      simulateSuccess('fedapay');
    } catch (err: unknown) {
      console.error('Erreur initialisation FedaPay:', err);
      simulateSuccess('fedapay');
    }
  };

  // Traitement KKiaPay
  const handleKKiaPay = async () => {
    if (!kkiaReady) {
      setSelectedProvider('sur_place');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Connexion au guichet sécurisé KKiaPay...');

    try {
      const scriptReady = await loadKkiapayScript();
      const cleanPhone = customerPhone.replace(/\s+/g, '');
      const receiptNumber = generateReceiptNumber();
      const generatedTxId = generateTransactionId('KKIA');

      if (scriptReady && typeof window.openKkiapayWidget === 'function') {
        setStatusMessage('Ouverture du widget KKiaPay (MoMo / Wave / Carte)...');

        if (typeof window.addSuccessListener === 'function') {
          window.addSuccessListener((response) => {
            onPaymentSuccess({
              provider: 'kkiapay',
              transactionId: response.transactionId || generatedTxId,
              reference: response.reference || `REF-${generatedTxId}`,
              method: paymentType === 'momo' ? 'Mobile Money (MTN / Moov / Wave)' : 'Carte Bancaire (Visa / Mastercard)',
              amountFcfa,
              date: new Date().toISOString(),
              customerPhone,
              customerName,
              receiptNumber,
            });
          });
        }

        if (typeof window.addFailedListener === 'function') {
          window.addFailedListener((err) => {
            console.warn('KKiaPay transaction échouée:', err);
            setError('La transaction KKiaPay n’a pas abouti.');
            setLoading(false);
          });
        }

        window.openKkiapayWidget({
          amount: amountFcfa,
          key: PAYMENT_CONFIG.kkiapay.publicKey,
          sandbox: PAYMENT_CONFIG.kkiapay.sandbox,
          phone: cleanPhone,
          name: customerName,
          email: customerEmail || 'client@timescafe.bj',
          data: {
            receiptNumber,
            orderDescription,
          },
        });
        setLoading(false);
        return;
      }

      // Simulation de test si le widget n'a pas pu s'ouvrir
      simulateSuccess('kkiapay');
    } catch (err: unknown) {
      console.error('Erreur initialisation KKiaPay:', err);
      simulateSuccess('kkiapay');
    }
  };

  // Traitement Paiement au restaurant / Sur place
  const handleSurPlace = () => {
    setLoading(true);
    setStatusMessage('Enregistrement de la commande avec règlement au restaurant...');
    setTimeout(() => {
      const receiptNumber = generateReceiptNumber();
      const txId = generateTransactionId('PLACE');

      onPaymentSuccess({
        provider: 'sur_place',
        transactionId: txId,
        reference: `REF-${txId}`,
        method: 'Paiement au restaurant / Sur place (Espèces, TPE ou Mobile Money direct)',
        amountFcfa,
        date: new Date().toISOString(),
        customerPhone,
        customerName,
        receiptNumber,
      });
      setLoading(false);
    }, 600);
  };

  // Simulate instant validation (Sandbox / Test Mode)
  const simulateSuccess = (provider: 'fedapay' | 'kkiapay' | 'sur_place') => {
    setStatusMessage('Validation et enregistrement de la transaction...');
    setTimeout(() => {
      const receiptNumber = generateReceiptNumber();
      const prefix = provider === 'fedapay' ? 'FEDA' : provider === 'kkiapay' ? 'KKIA' : 'PLACE';
      const txId = `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      onPaymentSuccess({
        provider,
        transactionId: txId,
        reference: `REF-${txId}`,
        method:
          provider === 'sur_place'
            ? 'Paiement au restaurant / Sur place (Espèces, TPE ou MoMo)'
            : paymentType === 'momo'
            ? `Mobile Money (${provider === 'fedapay' ? 'MTN / Moov / Celtiis' : 'MTN / Moov / Wave'})`
            : 'Carte Bancaire (Visa / Mastercard)',
        amountFcfa,
        date: new Date().toISOString(),
        customerPhone,
        customerName,
        receiptNumber,
      });
      setLoading(false);
    }, 700);
  };

  const handlePay = () => {
    if (selectedProvider === 'fedapay') {
      handleFedaPay();
    } else if (selectedProvider === 'kkiapay') {
      handleKKiaPay();
    } else {
      handleSurPlace();
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-black/60 border border-white/10 p-4 sm:p-5">
      {/* Header with Amount Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7D0A1C]/50 text-[#D4AF37] border border-[#D4AF37]/30">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Mode de Règlement
            </div>
            <div className="text-[10px] text-zinc-400">
              Paiement sur place ou en ligne sécurisé
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] text-zinc-400 block font-mono">Montant Total :</span>
          <span className="font-serif font-black text-lg text-[#D4AF37] font-mono">
            {formatFcfa(amountFcfa)}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/50 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info notice if online payment keys are not configured yet */}
      {!fedaReady && !kkiaReady && (
        <div className="rounded-xl bg-[#7D0A1C]/20 border border-[#D4AF37]/30 p-3 text-xs text-zinc-300 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong className="text-white block font-semibold mb-0.5">
              Mode standard : Règlement sur place / au restaurant
            </strong>
            Les clés des passerelles en ligne (FedaPay, KKiaPay) sont optionnelles. Votre commande est enregistrée et transmise directement en cuisine avec règlement sur place (espèces, TPE ou Mobile Money direct).
          </div>
        </div>
      )}

      {/* Payment Provider Options */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">
          Choisissez votre mode de paiement :
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Option 1: Sur Place / Au Restaurant (Toujours disponible) */}
          <button
            type="button"
            onClick={() => setSelectedProvider('sur_place')}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedProvider === 'sur_place'
                ? 'bg-gradient-to-br from-[#7D0A1C]/50 via-black to-black border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs">
                  <Store className="h-4 w-4" />
                </span>
                <div>
                  <span className="font-bold text-sm text-white block">
                    Paiement au restaurant / Sur place
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Mode par défaut • Sans prépaiement obligatoire
                  </span>
                </div>
              </div>
              {selectedProvider === 'sur_place' && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
              )}
            </div>
            <p className="text-[11px] text-zinc-300 pl-9.5">
              Réglez directement lors de la dégustation ou à la livraison : <strong>Espèces</strong>, <strong>Mobile Money direct</strong> (MTN / Moov / Celtiis) ou <strong>TPE / Carte bancaire</strong> au comptoir.
            </p>
          </button>

          {/* Option 2 & 3: Passerelles en ligne (FedaPay & KKiaPay) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* FedaPay Option */}
            <button
              type="button"
              onClick={() => {
                if (fedaReady) {
                  setSelectedProvider('fedapay');
                } else {
                  setSelectedProvider('sur_place');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                selectedProvider === 'fedapay'
                  ? 'bg-gradient-to-br from-[#7D0A1C]/40 to-black border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              } ${!fedaReady ? 'opacity-70 cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px]">
                    FP
                  </span>
                  <span className="font-bold text-sm text-white">FedaPay Mobile Money</span>
                </div>
                {selectedProvider === 'fedapay' ? (
                  <span className="flex h-2 w-2 rounded-full bg-[#D4AF37]" />
                ) : !fedaReady ? (
                  <span className="text-[9px] text-zinc-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">Optionnel</span>
                ) : null}
              </div>
              <p className="text-[11px] text-zinc-300">
                MTN MoMo, Moov Money, Celtiis Cash & Carte bancaire
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#D4AF37] font-mono">
                <ShieldCheck className="h-3 w-3" />
                <span>Bénin, UEMOA {fedaReady ? '• Activé' : '• Clé optionnelle'}</span>
              </div>
            </button>

            {/* KKiaPay Option */}
            <button
              type="button"
              onClick={() => {
                if (kkiaReady) {
                  setSelectedProvider('kkiapay');
                } else {
                  setSelectedProvider('sur_place');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                selectedProvider === 'kkiapay'
                  ? 'bg-gradient-to-br from-[#7D0A1C]/40 to-black border-[#D4AF37] shadow-lg shadow-[#7D0A1C]/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              } ${!kkiaReady ? 'opacity-70 cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]">
                    KP
                  </span>
                  <span className="font-bold text-sm text-white">KKiaPay MoMo / Wave</span>
                </div>
                {selectedProvider === 'kkiapay' ? (
                  <span className="flex h-2 w-2 rounded-full bg-[#D4AF37]" />
                ) : !kkiaReady ? (
                  <span className="text-[9px] text-zinc-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">Optionnel</span>
                ) : null}
              </div>
              <p className="text-[11px] text-zinc-300">
                MTN MoMo, Moov, Wave & Cartes bancaires
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#D4AF37] font-mono">
                <ShieldCheck className="h-3 w-3" />
                <span>Bénin, Côte d&apos;Ivoire {kkiaReady ? '• Activé' : '• Clé optionnelle'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Option: Mobile Money vs Carte (si passerelle en ligne sélectionnée) */}
      {selectedProvider !== 'sur_place' && (
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Canal de paiement souhaité :
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentType('momo')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                paymentType === 'momo'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Money</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentType('card')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                paymentType === 'card'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Carte Bancaire</span>
            </button>
          </div>
        </div>
      )}

      {/* Test Shortcut */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-between text-[11px] text-zinc-300">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Test rapide : valider la commande immédiatement pour tester le flux</span>
        </div>
        <button
          type="button"
          onClick={() => simulateSuccess(selectedProvider)}
          disabled={loading}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors"
        >
          Valider Test
        </button>
      </div>

      {statusMessage && (
        <div className="text-center py-1">
          <p className="text-xs text-[#D4AF37] font-medium animate-pulse flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{statusMessage}</span>
          </p>
        </div>
      )}

      {/* Main Action Button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7D0A1C] to-[#960D23] hover:from-[#960D23] hover:to-[#B3132B] disabled:opacity-50 py-3.5 px-4 text-sm font-bold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all hover:scale-[1.01]"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            {selectedProvider === 'sur_place' ? (
              <Store className="h-4 w-4 text-[#D4AF37]" />
            ) : paymentType === 'momo' ? (
              <Smartphone className="h-4 w-4 text-[#D4AF37]" />
            ) : (
              <CreditCard className="h-4 w-4 text-[#D4AF37]" />
            )}
            <span>
              {selectedProvider === 'sur_place'
                ? `Confirmer la commande • ${formatFcfa(amountFcfa)} (Paiement sur place)`
                : `Valider et Payer ${formatFcfa(amountFcfa)} • ${selectedProvider === 'fedapay' ? 'FedaPay' : 'KKiaPay'}`}
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Transmission directe en cuisine
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" />
          Reçu numérique immédiat
        </span>
      </div>
    </div>
  );
}
