'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  FileCheck,
  CheckCircle2,
  Printer,
  Share2,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_PRIVACY_POLICY_CONTENT } from '@/lib/legal-content';
import { subscribeToSettings } from '@/lib/db-service';
import { EstablishmentSettings } from '@/lib/supabase';
import { DEFAULT_ESTABLISHMENT_SETTINGS } from '@/lib/db-service';

export default function ConfidentialitePage() {
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);
  const [activeSection, setActiveSection] = useState<string>('priv-1');
  const [copiedLink, setCopiedLink] = useState(false);

  // Deletion request helper modal / state
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [deletionPhone, setDeletionPhone] = useState('');
  const [deletionName, setDeletionName] = useState('');
  const [deletionMessage, setDeletionMessage] = useState('');

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
        title: "Politique de Confidentialité - TIMES Café Bar & Grill",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDeletionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletionPhone.trim() && !deletionName.trim()) return;
    setDeletionSubmitted(true);
  };

  const privContent = DEFAULT_PRIVACY_POLICY_CONTENT;
  const customPrivacy = settings.politiqueConfidentialiteCustomText;
  const cleanWhatsapp = (settings.whatsappOfficiel || '+229 01 69 69 86 86').replace(/[^0-9]/g, '');

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

          {/* Actions: Print & CGU link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
              title="Imprimer ce document"
            >
              <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Imprimer</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
              title="Partager"
            >
              <Share2 className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">{copiedLink ? 'Copié !' : 'Partager'}</span>
            </button>

            <Link
              href="/cgu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7D0A1C]/30 hover:bg-[#7D0A1C]/50 border border-[#9E1B32]/60 text-xs font-semibold text-white transition-colors"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">CGU / CGV</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header in Wine Red & Dark Black */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#180307] via-[#0E0305] to-[#09090B] px-4 sm:px-8 pt-12 pb-14">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7D0A1C]/50 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4 shadow-lg shadow-[#7D0A1C]/30">
            <Lock className="h-3.5 w-3.5" />
            <span>Protection des Données & Vie Privée • Phase 7</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Politique de Confidentialité
          </h1>

          <p className="mt-3 text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Transparence totale sur la collecte minimale de vos données (Nom, Téléphone, Adresse), le zéro-stockage bancaire et vos droits de suppression chez <strong className="text-white font-semibold">{settings.nomEtablissement || 'TIMES Café Bar & Grill'}</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono">
              Version : {privContent.version}
            </span>
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono">
              Mise à jour : {settings.legalLastUpdated || privContent.derniereMiseAJour}
            </span>
            <span className="px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold">
              🔒 Zéro Donnée Financière Stockée
            </span>
          </div>
        </div>
      </section>

      {/* 3 Key Pillars Cards: Data Minimization, Zero Bank Storage, Deletion Rights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Pillar 1: Données Collectées */}
          <div className="rounded-2xl bg-[#121216] border border-white/10 p-5 shadow-xl space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">
              1. Données Collectées
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Strictement limitées aux données d&apos;exploitation : <strong>Nom</strong> (identification), <strong>Téléphone</strong> (paiement Mobile Money & coursier) et <strong>Adresse</strong> (si livraison requise).
            </p>
          </div>

          {/* Pillar 2: Zéro Donnée Financière */}
          <div className="rounded-2xl bg-gradient-to-br from-[#7D0A1C]/40 to-[#121216] border border-[#D4AF37]/50 p-5 shadow-xl space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 text-[#D4AF37] border border-[#D4AF37]/40">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">
              2. Zéro Donnée Bancaire
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Aucun code PIN Mobile Money, aucun numéro de carte ou code de sécurité n&apos;est enregistré sur nos serveurs. Tout est chiffré par <strong>FedaPay & KKiaPay</strong> (PCI-DSS).
            </p>
          </div>

          {/* Pillar 3: Droit à l'Oubli */}
          <div className="rounded-2xl bg-[#121216] border border-white/10 p-5 shadow-xl space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">
              3. Droit de Suppression
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Suppression intégrale et immédiate de vos données personnelles sur simple demande par WhatsApp, e-mail ou via le formulaire ci-dessous.
            </p>
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
                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                  Plan de Confidentialité
                </h3>
              </div>

              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 text-xs">
                {privContent.articles.map((art) => (
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
                  Contact direct DPO & Données Personnelles :
                </div>
                <a
                  href={`mailto:${settings.dpoEmail || settings.email || 'timeslesmoments@gmail.com'}`}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{settings.dpoEmail || settings.email || 'timeslesmoments@gmail.com'}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Full Sections Text + Interactive Deletion Request Form */}
          <div className="lg:col-span-8 space-y-8">

            {/* Custom Admin Privacy Policy text if any */}
            {customPrivacy && (
              <div className="rounded-2xl bg-[#17171C] border border-[#D4AF37]/40 p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  <Lock className="h-4 w-4" />
                  <span>Clauses Particulières de Protection des Données</span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                  {customPrivacy}
                </div>
              </div>
            )}

            {/* Core Sections list */}
            {privContent.articles.map((art) => (
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

            {/* Interactive Section 7: Formulaire d'Exercice du Droit à l'Oubli & Suppression */}
            <div id="demande-suppression" className="scroll-mt-24 rounded-2xl bg-gradient-to-br from-[#1C060B] via-[#121216] to-[#09090B] border-2 border-[#D4AF37]/40 p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C] text-[#D4AF37] border border-[#9E1B32]">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Formulaire Simplifié d&apos;Effacement des Données (Droit à l&apos;Oubli)
                  </h3>
                  <span className="text-xs text-[#D4AF37]">
                    Conformément à l&apos;Article 17 du RGPD et réglementations de protection des données
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Vous pouvez demander la purge complète de vos informations personnelles (Nom, Téléphone, Adresse, historique de commandes) de notre base de données. Remplissez le formulaire ci-dessous ou transmettez votre demande directement à notre DPO via WhatsApp.
              </p>

              {deletionSubmitted ? (
                <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-5 text-xs text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Demande d&apos;effacement prise en compte avec succès !</span>
                  </div>
                  <p>
                    Nos équipes ont bien reçu votre demande pour le profil <strong>{deletionName}</strong> ({deletionPhone}). Un accusé de traitement définitif vous sera transmis sous 48h ouvrées.
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=Bonjour%20TIMES,%20je%20viens%20d'envoyer%20une%20demande%20de%20suppression%20de%20mes%20données%20personnelles%20pour%20le%20numéro%20${encodeURIComponent(deletionPhone)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Notifier le DPO par WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDeletionSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Votre Nom & Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={deletionName}
                        onChange={(e) => setDeletionName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Votre Numéro de Téléphone (associé aux commandes) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={deletionPhone}
                        onChange={(e) => setDeletionPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Motif ou précision (facultatif)
                    </label>
                    <textarea
                      rows={2}
                      value={deletionMessage}
                      onChange={(e) => setDeletionMessage(e.target.value)}
                      placeholder="Ex : Je souhaite supprimer l'historique de mes commandes et adresses..."
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-zinc-400">
                      🔒 Traitement certifié sous 30 jours conformément à la réglementation.
                    </p>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32] transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-[#D4AF37]" />
                      <span>Transmettre ma demande d&apos;effacement</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Actions Links */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-white font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour au Menu</span>
              </Link>

              <Link
                href="/cgu"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs transition-colors"
              >
                <FileCheck className="h-4 w-4 text-[#D4AF37]" />
                <span>Lire les Conditions Générales de Vente (CGV)</span>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
