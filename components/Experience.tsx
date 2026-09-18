'use client';

import React from 'react';
import { Coffee, Wine, Flame, Award, ShieldCheck, HeartHandshake, Compass } from 'lucide-react';

export function Experience() {
  const experiences = [
    {
      icon: Coffee,
      title: 'L\'Art du Barista',
      subtitle: 'Café de Terroir & Matinées Calmes',
      description:
        'Chaque tasse chez TIMES est le fruit d’un travail minutieux : grains 100% Arabica récoltés à la main, torréfaction respectueuse de l\'acidité naturelle et extraction réglée au gramme près.',
      highlights: ['Mouture à la commande', 'Laits végétaux bio & gourmands', 'Pâtisseries fraîches du jour'],
      timeSlot: '08h00 — 12h00 & Après-midi',
    },
    {
      icon: Wine,
      title: 'Le Bar & Mixologie',
      subtitle: 'Alchimie Nocturne & Vins Fins',
      description:
        'À la tombée de la nuit, le comptoir s’anime au rythme des shakers. Nos barmen revisitent les grands classiques avec des infusions fumées maison et une cave sélectionnée auprès des meilleurs vignerons.',
      highlights: ['Cocktails fumés minute', 'Sélection de vins naturels & bio', 'Planches apéritives à partager'],
      timeSlot: '17h00 — 02h00',
    },
    {
      icon: Flame,
      title: 'La Braise & Le Grill',
      subtitle: 'Saveurs Féroces & Maîtrise du Feu',
      description:
        'Une cuisson authentique sur braises de chêne et de hêtre. La flamme saisit la viande à haute température, scellant les sucs pour une texture tendre et un parfum boisé inimitable.',
      highlights: ['Bœuf Black Angus maturé', 'Cuisson personnalisée au degré près', 'Sauces et beurres maîtres d\'hôtel maison'],
      timeSlot: '12h00 — 14h30 & 19h00 — 23h30',
    },
  ];

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#D4AF37] mb-3">
            <Compass className="h-3.5 w-3.5" />
            L’Expérience Culinaire
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Trois Univers, Une Même Passion
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            TIMES allie le raffinement feutré d’un salon de café, l’effervescence d’un bar à cocktails et l’intensité aromatique du grill.
          </p>
        </div>

        {/* 3 Experience Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {experiences.map((exp, idx) => {
            const Icon = exp.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl bg-[#121216] border border-white/10 hover:border-[#D4AF37]/50 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Top indicator */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#2D0308] border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg group-hover:scale-105 transition-transform">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#D4AF37] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {exp.timeSlot}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                    {exp.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-4">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                    {exp.description}
                  </p>
                </div>

                {/* Highlights list */}
                <div className="pt-4 border-t border-white/10">
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commitment Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#170509] via-[#101014] to-[#170509] border border-[#7D0A1C]/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7D0A1C]/40 text-[#D4AF37] border border-[#D4AF37]/30">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">
                Engagement Qualité & Produits d’Origine
              </h4>
              <p className="text-xs text-zinc-400 max-w-xl mt-0.5">
                Viandes certifiées, torréfaction hebdomadaire et réduction maison. Nous privilégions les circuits courts et les saveurs franches.
              </p>
            </div>
          </div>
          <a
            href="#carte"
            className="shrink-0 px-5 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            Découvrir notre sélection
          </a>
        </div>

      </div>
    </section>
  );
}
