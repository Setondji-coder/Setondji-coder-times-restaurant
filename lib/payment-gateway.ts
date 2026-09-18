'use client';

// Configuration des passerelles de paiement FedaPay & KKiaPay (Optionnelle)
export const PAYMENT_CONFIG = {
  fedapay: {
    publicKey: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || '',
    environment: (process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
    scriptUrl: 'https://cdn.fedapay.com/checkout.js?v=1.1.7',
  },
  kkiapay: {
    publicKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '',
    sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== 'false',
    scriptUrl: 'https://cdn.kkiapay.me/k.js',
  },
};

/**
 * Vérifie si la passerelle FedaPay est configurée avec une clé valide
 */
export function isFedaPayConfigured(): boolean {
  const key = PAYMENT_CONFIG.fedapay.publicKey;
  return Boolean(key && key.trim() !== '' && !key.includes('votre-cle'));
}

/**
 * Vérifie si la passerelle KKiaPay est configurée avec une clé valide
 */
export function isKkiapayConfigured(): boolean {
  const key = PAYMENT_CONFIG.kkiapay.publicKey;
  return Boolean(key && key.trim() !== '' && !key.includes('votre-cle'));
}

/**
 * Vérifie si au moins une passerelle de paiement en ligne est active
 */
export function hasOnlinePaymentGateways(): boolean {
  return isFedaPayConfigured() || isKkiapayConfigured();
}

/**
 * Formate un montant directement en FCFA (XOF)
 * Ex: 5000 -> "5 000 FCFA"
 */
export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0)) + ' FCFA';
}

// Alias officiel pour compatibilité
export const formatXof = formatFcfa;

export function generateReceiptNumber(orderId?: string): string {
  const year = new Date().getFullYear();
  const randomSuffix = orderId 
    ? orderId.slice(0, 6).toUpperCase() 
    : Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REC-TMS-${year}-${randomSuffix}`;
}

export function generateTransactionId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomCode}`;
}

// Script Loaders sécurisés sans plantage
let fedapayScriptPromise: Promise<boolean> | null = null;
export function loadFedaPayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as unknown as { FedaPay?: unknown }).FedaPay) return Promise.resolve(true);
  if (!isFedaPayConfigured()) return Promise.resolve(false);
  if (fedapayScriptPromise) return fedapayScriptPromise;

  fedapayScriptPromise = new Promise((resolve) => {
    try {
      const existing = document.querySelector(`script[src="${PAYMENT_CONFIG.fedapay.scriptUrl}"]`);
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = PAYMENT_CONFIG.fedapay.scriptUrl;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Script FedaPay non chargé ou inaccessible.');
        resolve(false);
      };
      document.body.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return fedapayScriptPromise;
}

let kkiapayScriptPromise: Promise<boolean> | null = null;
export function loadKkiapayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as unknown as { openKkiapayWidget?: unknown }).openKkiapayWidget) return Promise.resolve(true);
  if (!isKkiapayConfigured()) return Promise.resolve(false);
  if (kkiapayScriptPromise) return kkiapayScriptPromise;

  kkiapayScriptPromise = new Promise((resolve) => {
    try {
      const existing = document.querySelector(`script[src="${PAYMENT_CONFIG.kkiapay.scriptUrl}"]`);
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = PAYMENT_CONFIG.kkiapay.scriptUrl;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Script KKiaPay non chargé ou inaccessible.');
        resolve(false);
      };
      document.body.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return kkiapayScriptPromise;
}

export interface PaymentSuccessResult {
  provider: 'fedapay' | 'kkiapay' | 'sur_place';
  transactionId: string;
  reference: string;
  method: string;
  amountFcfa: number;
  date: string;
  customerPhone?: string;
  customerName?: string;
  receiptNumber: string;
}

// Global window declarations
declare global {
  interface Window {
    FedaPay?: {
      init: (options: Record<string, unknown>) => {
        open: () => void;
      };
      DIALOG?: {
        open: (options: Record<string, unknown>) => void;
      };
    };
    openKkiapayWidget?: (options: {
      amount: number;
      key: string;
      sandbox: boolean;
      phone?: string;
      name?: string;
      email?: string;
      data?: Record<string, unknown>;
      callback?: string;
    }) => void;
    addSuccessListener?: (callback: (response: { transactionId?: string; reference?: string; status?: string }) => void) => void;
    addFailedListener?: (callback: (error: unknown) => void) => void;
  }
}
