'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook, ArrowUp, Check, Sparkles } from 'lucide-react';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#060608] border-t border-white/10 text-zinc-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-white/10">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#3B040B] border border-[#D4AF37]/50 shadow-md">
                <span className="font-serif text-xl font-black text-[#D4AF37]">T</span>
              </div>
              <div>
                <div className="font-serif text-xl font-black tracking-widest text-white">TIMES</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                  Café • Bar • Grill
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Une adresse d&apos;exception à Cotonou où se rencontrent l’excellence barista, les cocktails d’auteur et l’authenticité des grillades au feu de bois.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <a
                href="#instagram"
                aria-label="Instagram de TIMES"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-[#D4AF37] hover:bg-[#7D0A1C]/30 border border-white/10 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#facebook"
                aria-label="Facebook de TIMES"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-[#D4AF37] hover:bg-[#7D0A1C]/30 border border-white/10 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <span className="text-[11px] text-zinc-500 ml-2">@timescafebargrill</span>
            </div>
          </div>

          {/* Column 2: Coordonnées & Accès Officiels */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Coordonnées & Accès
            </h4>
            
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad.<br />
                  Cotonou — Bénin
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <div className="flex flex-wrap gap-x-2 font-mono">
                  <a href="tel:+2290169698686" className="hover:text-white transition-colors">
                    +229 01 69 69 86 86
                  </a>
                  <span>/</span>
                  <a href="tel:+2290191493333" className="hover:text-white transition-colors">
                    +229 01 91 49 33 33
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <a href="mailto:timeslesmoments@gmail.com" className="hover:text-white transition-colors">
                  timeslesmoments@gmail.com
                </a>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-zinc-500">
              PK6 Akpakpa Le Bélier • Voie pavée vers la plage face CenSad
            </div>
          </div>

          {/* Column 3: Navigation & Conformité Légale */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Informations & Légal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#accueil" className="hover:text-[#D4AF37] transition-colors">Accueil</a>
              </li>
              <li>
                <a href="#experience" className="hover:text-[#D4AF37] transition-colors">L’Art du Barista & des Braises</a>
              </li>
              <li>
                <a href="#carte" className="hover:text-[#D4AF37] transition-colors">La Carte & Spécialités</a>
              </li>
              <li>
                <a href="#evenements" className="hover:text-[#D4AF37] transition-colors">Soirées Live & Horaires</a>
              </li>
              <li>
                <a href="#reservation" className="hover:text-[#D4AF37] transition-colors">Réservation en Ligne</a>
              </li>
              <li className="pt-1">
                <Link
                  href="/cgu"
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#D4AF37] transition-colors"
                >
                  <span className="text-[#D4AF37] text-xs">§</span>
                  <span>Conditions Générales (CGU / CGV)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#D4AF37] transition-colors"
                >
                  <span className="text-[#D4AF37] text-xs">🔒</span>
                  <span>Politique de Confidentialité</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Club Privilège / Newsletter */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Club Privilège TIMES
            </h4>
            <p className="text-xs text-zinc-400">
              Recevez en avant-première nos invitations aux soirées dégustation et nouveautés culinaires.
            </p>

            {newsletterSubmitted ? (
              <div className="rounded-xl bg-[#7D0A1C]/30 border border-[#D4AF37]/40 p-3 text-xs text-zinc-200 flex items-center gap-2">
                <Check className="h-4 w-4 text-[#D4AF37]" />
                <span>Merci, votre invitation a été envoyée !</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="votre-email@domaine.bj"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-[#7D0A1C]/30 border border-[#9E1B32] transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Rejoindre le Club</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar avec mention exacte requise */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="font-medium text-zinc-300">TIMES Café Bar & Grill • © 2026 Tous droits réservés</p>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="text-[11px] text-[#D4AF37]/80 flex items-center justify-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Devise officielle : Franc CFA (FCFA) • Paiements sécurisés
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cgu" className="hover:text-[#D4AF37] transition-colors text-[11px]">
              CGU/CGV
            </Link>
            <Link href="/confidentialite" className="hover:text-[#D4AF37] transition-colors text-[11px]">
              Confidentialité
            </Link>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Retour en haut"
              aria-label="Retour en haut"
            >
              <ArrowUp className="h-4 w-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
