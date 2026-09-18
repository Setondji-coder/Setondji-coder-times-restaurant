'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  ChefHat,
  Bike,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_CGU_CGV_CONTENT } from '@/lib/legal-content';
import { subscribeToSettings } from '@/lib/db-service';
import { EstablishmentSettings } from '@/lib/supabase';
import { DEFAULT_ESTABLISHMENT_SETTINGS } from '@/lib/db-service';

export default function CGUPage() {
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);
  const [activeSection, setActiveSection] = useState<string>('art-1');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Conditions Générales d'Utilisation et de Vente - TIMES Café Bar & Grill",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const cguContent = DEFAULT_CGU_CGV_CONTENT;
  const customCgu = settings.cguCustomText;

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-200 selection:bg-[#7D0A1C] selection:text-white pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-[#D4AF37] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour au restaurant</span>
          </Link>

          {/* Center Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#3B040B] border border-[#D4AF37]/50 shadow-md">
              <span className="font-serif text-lg font-black text-[#D4AF37]">T</span>
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-serif text-base font-bold text-white tracking-wider block leading-none">
                {settings.nomEtablissement || 'TIMES'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Café • Bar • Grill
              </span>
            </div>
          </Link>

          {/* Actions: Print & Policy link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
              title="Imprimer ce document légal"
            >
              <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Imprimer</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
              title="Partager le lien"
            >
              <Share2 className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">{copiedLink ? 'Lien copié !' : 'Partager'}</span>
            </button>

            <Link
              href="/confidentialite"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7D0A1C]/30 hover:bg-[#7D0A1C]/50 border border-[#9E1B32]/60 text-xs font-semibold text-white transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Confidentialité</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header in Wine Red & Dark Black */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#180307] via-[#0E0305] to-[#09090B] px-4 sm:px-8 pt-12 pb-14">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7D0A1C]/50 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4 shadow-lg shadow-[#7D0A1C]/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Document Juridique Officiel • Phase 7</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Conditions Générales d&apos;Utilisation et de Vente
          </h1>

          <p className="mt-3 text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Régissant les commandes en ligne, livraisons, encaissements Mobile Money (FedaPay, KKiaPay) et prestations au sein de <strong className="text-white font-semibold">{settings.nomEtablissement || 'TIMES Café Bar & Grill'}</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono">
              Version : {cguContent.version}
            </span>
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono">
              Mise à jour : {settings.legalLastUpdated || cguContent.derniereMiseAJour}
            </span>
            <span className="px-3 py-1 rounded-md bg-[#7D0A1C]/30 border border-[#9E1B32] text-amber-200 font-semibold">
              Règle d&apos;annulation : Ferme dès « En préparation »
            </span>
          </div>
        </div>
      </section>

      {/* Critical Highlight Alert: Cancellation Policy Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#7D0A1C] via-[#590714] to-[#3B040B] border-2 border-[#D4AF37] p-5 sm:p-6 shadow-2xl shadow-black/80">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/40 border border-[#D4AF37] text-[#D4AF37] shadow">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/50 text-[#D4AF37] border border-[#D4AF37]/40">
                  Article 7 • Règle Impérative
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                  Politique Stricte d&apos;Annulation des Commandes
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
                En raison de la préparation immédiate des denrées périssables, de la découpe des viandes maturées et des cuissons minute au feu de bois : 
                <strong className="text-[#D4AF37] block sm:inline font-bold">
                  {' '}AUCUNE ANNULATION NI REMBOURSEMENT N&apos;EST POSSIBLE UNE FOIS LE STATUT « EN PRÉPARATION » ACTIVÉ PAR LA CUISINE OU LE BAR.
                </strong>
              </p>
              <p className="text-[11px] text-zinc-300">
                Toute modification ou annulation doit impérativement intervenir dans les 2 minutes suivant la commande avant prise en compte par nos chefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Interactive Table of Contents (Sticky) */}
          <aside className="lg:col-span-4 sticky top-20 hidden lg:block">
            <div className="rounded-2xl bg-[#121216] border border-white/10 p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
                <FileText className="h-4 w-4 text-[#D4AF37]" />
                <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                  Sommaire des Articles
                </h3>
              </div>

              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 text-xs">
                {cguContent.articles.map((art) => (
                  <a
                    key={art.id}
                    href={`#${art.id}`}
                    onClick={() => setActiveSection(art.id)}
                    className={`block px-3 py-2 rounded-xl transition-colors ${
                      activeSection === art.id
                        ? 'bg-[#7D0A1C] text-white font-semibold shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[#D4AF37] font-mono mr-1.5">{art.numero} :</span>
                    <span>{art.titre.split('(')[0]}</span>
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                <div className="text-[11px] text-zinc-400">
                  Besoin d&apos;aide ou d&apos;assistance immédiate ?
                </div>
                <a
                  href={`https://wa.me/${(settings.whatsappOfficiel || '+2290169698686').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp Officiel</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Full Articles Text */}
          <div className="lg:col-span-8 space-y-8">

            {/* Custom Admin Announcement Clause if any */}
            {customCgu && (
              <div className="rounded-2xl bg-[#17171C] border border-[#D4AF37]/40 p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  <Sparkles className="h-4 w-4" />
                  <span>Dispositions Particulières de la Direction</span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                  {customCgu}
                </div>
              </div>
            )}

            {/* Core Articles list */}
            {cguContent.articles.map((art) => (
              <article
                key={art.id}
                id={art.id}
                className="scroll-mt-24 rounded-2xl bg-[#111115] border border-white/10 p-6 sm:p-8 space-y-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#7D0A1C]/50 border border-[#9E1B32] text-[#D4AF37] font-mono text-xs font-bold shrink-0">
                      {art.numero}
                    </span>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                      {art.titre}
                    </h2>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans space-y-2">
                  {art.contenu}
                </div>
              </article>
            ))}

            {/* Quick Links & Assistance Box */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1A0307] to-[#111115] border border-white/10 p-6 sm:p-8 space-y-5">
              <h3 className="font-serif text-lg font-bold text-white">
                Assistance Clientèle & Réclamations
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Pour toute question relative à votre commande, contestation de paiement Mobile Money ou demande relative aux allergènes, notre brigade et notre service client sont à votre entière disposition :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                  <Phone className="h-4 w-4 text-[#D4AF37]" />
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Téléphone Restaurant</span>
                    <a href="tel:+2290169698686" className="text-white font-mono font-bold hover:text-[#D4AF37]">
                      {settings.telephone || '+229 01 69 69 86 86 / +229 01 91 49 33 33'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">WhatsApp Officiel</span>
                    <a
                      href={`https://wa.me/${(settings.whatsappOfficiel || '+2290169698686').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-mono font-bold hover:text-emerald-400"
                    >
                      {settings.whatsappOfficiel || '+229 01 69 69 86 86'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-white font-semibold text-xs transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retourner à la Carte</span>
                </Link>

                <Link
                  href="/confidentialite"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                  <span>Consulter la Politique de Confidentialité</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
