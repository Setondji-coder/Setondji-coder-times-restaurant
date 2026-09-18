'use client';

import React from 'react';
import { Flame, Coffee, GlassWater, Sparkles, Clock, MapPin, ChevronRight, Star } from 'lucide-react';

interface HeroProps {
  onOpenReservation?: () => void;
}

export function Hero({ onOpenReservation }: HeroProps) {
  return (
    <section
      id="accueil"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#09090B] via-[#0D0D11] to-[#09090B]"
    >
      {/* Subtle atmospheric ambient glow (deep wine red and warm gold) */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#7D0A1C]/15 rounded-full blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute bottom-10 left-1/4 w-[300px] h-[200px] bg-[#D4AF37]/8 rounded-full blur-[100px]" />
      
      {/* Subtle grilled texture / geometric grid backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />

      <div className="relative max-w-5xl mx-auto text-center">
        
        {/* Prestige Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#D4AF37]/30 text-xs text-zinc-300 mb-6 backdrop-blur-md">
          <Star className="h-3 w-3 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="tracking-widest uppercase font-semibold text-[11px] text-[#D4AF37]">
            L’Établissement Gourmand & Convivial
          </span>
          <Star className="h-3 w-3 text-[#D4AF37] fill-[#D4AF37]" />
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          <span>TIMES</span>{' '}
          <span className="block text-2xl sm:text-4xl md:text-5xl font-light text-zinc-200 mt-2">
            Café • Bar & Grill
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-10">
          Du premier espresso de terroir au petit matin, aux créations de cocktails au coucher du soleil,
          jusqu’aux <span className="text-[#D4AF37] font-medium">viandes d’exception saisies sur braises ardentes</span>.
        </p>

        {/* Action Buttons: Blanc & Rouge Vin */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Button Rouge Vin */}
          <a
            id="hero-btn-reserver"
            href="#reservation"
            onClick={() => onOpenReservation?.()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-white font-semibold text-sm sm:text-base shadow-xl shadow-[#7D0A1C]/35 border border-[#9E1B32] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span>Réserver une Table</span>
          </a>

          {/* Button Blanc */}
          <a
            id="hero-btn-carte"
            href="#carte"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-[#09090B] font-semibold text-sm sm:text-base border border-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Consulter la Carte</span>
            <ChevronRight className="h-4 w-4 text-[#7D0A1C]" />
          </a>
        </div>

        {/* Three Core Pillars Banner with Golden Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Pillar 1: Café */}
          <div className="group rounded-2xl bg-[#131317]/80 border border-white/10 hover:border-[#D4AF37]/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30 group-hover:bg-[#7D0A1C]/20 transition-colors">
                <Coffee className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Le Café de Terroir</h3>
                <span className="text-[11px] text-[#D4AF37] font-medium uppercase tracking-wider">08h00 — 18h00</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Grains de spécialité rigoureusement sourcés, extraction barista et viennoiseries du jour.
            </p>
          </div>

          {/* Pillar 2: Bar */}
          <div className="group rounded-2xl bg-[#131317]/80 border border-white/10 hover:border-[#D4AF37]/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30 group-hover:bg-[#7D0A1C]/20 transition-colors">
                <GlassWater className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Le Bar à Cocktails</h3>
                <span className="text-[11px] text-[#D4AF37] font-medium uppercase tracking-wider">17h00 — 02h00</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mixologie sur-mesure, fumages minute, sélection exclusive de vins de vignerons indépendants.
            </p>
          </div>

          {/* Pillar 3: Grill */}
          <div className="group rounded-2xl bg-[#131317]/80 border border-white/10 hover:border-[#D4AF37]/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30 group-hover:bg-[#7D0A1C]/20 transition-colors">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Le Grill & Braises</h3>
                <span className="text-[11px] text-[#D4AF37] font-medium uppercase tracking-wider">12h00 — 23h30</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Viandes maturées, cuissons directes au feu de bois et jus réduits parfumés aux herbes sauvages.
            </p>
          </div>
        </div>

        {/* Live operational badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Service en continu aujourd’hui</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Lundi au Dimanche : 08h00 - 02h00</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Terrasse chauffée & Salle climatisée</span>
          </div>
        </div>

      </div>
    </section>
  );
}
