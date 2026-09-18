'use client';

import React from 'react';
import { Calendar, Music, Flame, GlassWater, Clock, Sparkles, PartyPopper } from 'lucide-react';

export function EventsHoursSection() {
  const events = [
    {
      day: 'Chaque Mercredi',
      title: 'Acoustic Jazz & Wine Session',
      time: '19h30 — 22h30',
      description: 'Duo acoustique contrebasse & saxophone en live. Dégustation de notre sélection de vins rouges et planches de viandes séchées.',
      badge: 'Live Music',
      icon: Music,
    },
    {
      day: 'Jeudi Soir',
      title: 'Afterwork Mixologie & Smoked Bites',
      time: '18h00 — 21h00',
      description: 'Cocktails signatures à tarif préférentiel et petites brochettes braisées offertes pour toute commande au comptoir.',
      badge: 'Afterwork',
      icon: GlassWater,
    },
    {
      day: 'Vendredi & Samedi',
      title: 'Night Braises & Groove Set',
      time: '21h00 — 01h30',
      description: 'Ambiance lounge assurée par notre DJ résident, découpe de pièces de bœuf d\'exception et carte de cocktails tardive.',
      badge: 'Soirée Phare',
      icon: Flame,
    },
    {
      day: 'Dimanche',
      title: 'Barista Brunch & Grill du Dimanche',
      time: '11h00 — 16h00',
      description: 'Formule complète mêlant cafés de terroir à volonté, œufs brouillés truffés, pancakes briochés et viandes fumées minute.',
      badge: 'Brunch Convivial',
      icon: Sparkles,
    },
  ];

  const openingHours = [
    { days: 'Lundi — Mercredi', hours: '08h00 — 00h00', note: 'Café, Déjeuner & Bar' },
    { days: 'Jeudi — Vendredi', hours: '08h00 — 02h00', note: 'Soirées Mixologie & Grill' },
    { days: 'Samedi', hours: '09h00 — 02h00', note: 'Service en continu & DJ Set' },
    { days: 'Dimanche', hours: '09h30 — 23h00', note: 'Brunch & Dîner dominical' },
  ];

  return (
    <section id="evenements" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left column: Événements & Soirées */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#D4AF37] mb-3">
              <PartyPopper className="h-3.5 w-3.5" />
              L’Ambiance TIMES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Moments Forts & Soirées Thématiques
            </h2>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              De l’intimité d’une fin d’après-midi feutrée aux accords rythmés de nos soirées en terrasse et au comptoir.
            </p>

            <div className="space-y-4">
              {events.map((ev, i) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={i}
                    className="group rounded-2xl bg-[#121216] border border-white/10 hover:border-[#D4AF37]/50 p-5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30 group-hover:bg-[#7D0A1C]/25 transition-colors">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#D4AF37]">
                              {ev.day}
                            </span>
                            <span className="rounded-full bg-[#7D0A1C]/40 border border-[#7D0A1C] px-2 py-0.2 text-[10px] text-zinc-200">
                              {ev.badge}
                            </span>
                          </div>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                            {ev.title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 shrink-0 bg-white/5 px-2.5 py-1 rounded-lg">
                        {ev.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 pl-13 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Horaires d'ouverture & Contact rapide */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#121216] border border-[#D4AF37]/30 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C] text-[#D4AF37] border border-[#D4AF37]/40">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Horaires d’Ouverture
                  </h3>
                  <p className="text-xs text-[#D4AF37]">Service 7 jours sur 7</p>
                </div>
              </div>

              <div className="space-y-4">
                {openingHours.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-white/5 text-xs sm:text-sm"
                  >
                    <div>
                      <div className="font-medium text-white">{h.days}</div>
                      <div className="text-[11px] text-zinc-400">{h.note}</div>
                    </div>
                    <div className="font-mono font-bold text-[#D4AF37] text-right">
                      {h.hours}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="rounded-xl bg-white/5 p-3.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Cuisine Grillades</span>
                  <span className="text-zinc-400">Dernière commande : 23h15</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#reservation"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32] transition-colors"
                >
                  <Calendar className="h-4 w-4 text-[#D4AF37]" />
                  Réserver pour ce soir
                </a>
              </div>
            </div>

            {/* Quick privatizations info */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
                Privatisation & Groupes
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                TIMES propose des espaces dédiés pour vos séminaires, anniversaires ou soirées privées jusqu’à 80 convives avec menu sur mesure.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
