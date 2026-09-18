'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Coffee, Wine, Flame, Sparkles, CheckCircle2, Phone, Mail } from 'lucide-react';

export function ReservationSection() {
  const [service, setService] = useState('diner');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    { id: 'matin', label: 'Café & Douceurs', timeRange: '08:00 - 11:30', icon: Coffee },
    { id: 'dejeuner', label: 'Déjeuner Grill', timeRange: '12:00 - 14:30', icon: Flame },
    { id: 'afterwork', label: 'Bar & Afterwork', timeRange: '17:00 - 19:30', icon: Wine },
    { id: 'diner', label: 'Dîner & Braises', timeRange: '19:30 - 23:00', icon: Sparkles },
  ];

  const timeSlots = {
    matin: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00'],
    dejeuner: ['12:00', '12:30', '13:00', '13:30', '14:00'],
    afterwork: ['17:00', '17:30', '18:00', '18:30', '19:00'],
    diner: ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
  }[service] || ['19:30', '20:00', '20:30', '21:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <section id="reservation" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#09090B] via-[#0E0E12] to-[#09090B] border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#D4AF37] mb-3">
            <CalendarIcon className="h-3.5 w-3.5" />
            Votre Table Vous Attend
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Réservation Instantanée
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Pour un déjeuner d’affaires, une dégustation de cocktails ou une soirée grillades au feu de bois, garantissez votre place en quelques secondes.
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#121216] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/50 mb-5">
              <CheckCircle2 className="h-8 w-8 text-[#D4AF37]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Demande de Réservation Enregistrée !
            </h3>
            <p className="text-sm text-zinc-300 max-w-lg mx-auto mb-6">
              Merci <strong className="text-white">{name}</strong>. Notre équipe chez <span className="text-[#D4AF37]">TIMES Café Bar & Grill</span> vous confirme votre table pour <strong className="text-white">{guests} personne{Number(guests) > 1 ? 's' : ''}</strong> le <strong className="text-white">{date}</strong> à <strong className="text-white">{time}</strong>.
            </p>

            <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs text-zinc-400 border border-white/10 mb-6">
              <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
              Un SMS de confirmation a été transmis au <span className="font-mono text-zinc-200">{phone}</span>
            </div>

            <div>
              <button
                id="btn-new-reservation"
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-white hover:bg-zinc-100 text-[#09090B] font-semibold text-xs sm:text-sm px-6 py-2.5 transition-colors"
              >
                Effectuer une autre réservation
              </button>
            </div>
          </div>
        ) : (
          <form
            id="form-reservation"
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8 shadow-2xl shadow-black/80"
          >
            {/* Step 1: Choisir le service */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                1. Choisissez votre moment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {services.map((s) => {
                  const Icon = s.icon;
                  const isCurrent = service === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setService(s.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-[#7D0A1C] border-[#9E1B32] text-white shadow-md shadow-[#7D0A1C]/40'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1 ${isCurrent ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                      <span className="text-xs font-semibold">{s.label}</span>
                      <span className="text-[10px] text-zinc-300/80 mt-0.5">{s.timeRange}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date, Heure, Couverts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="res-date" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Date
                </label>
                <input
                  id="res-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label htmlFor="res-time" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Créneau horaire
                </label>
                <select
                  id="res-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t} className="bg-[#121216] text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="res-guests" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Convives
                </label>
                <select
                  id="res-guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="1" className="bg-[#121216]">1 Personne (Comptoir Barista)</option>
                  <option value="2" className="bg-[#121216]">2 Personnes (Table Duo)</option>
                  <option value="3" className="bg-[#121216]">3 Personnes</option>
                  <option value="4" className="bg-[#121216]">4 Personnes (Carré Intime)</option>
                  <option value="5" className="bg-[#121216]">5 Personnes</option>
                  <option value="6" className="bg-[#121216]">6 Personnes (Grande Table)</option>
                  <option value="8" className="bg-[#121216]">8 Personnes</option>
                  <option value="10" className="bg-[#121216]">10+ Personnes (Groupe & Événement)</option>
                </select>
              </div>
            </div>

            {/* Step 3: Coordonnées de contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="res-name" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nom & Prénom *
                </label>
                <input
                  id="res-name"
                  type="text"
                  required
                  placeholder="ex : Alexandre Martin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label htmlFor="res-phone" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Téléphone Mobile *
                </label>
                <input
                  id="res-phone"
                  type="tel"
                  required
                  placeholder="ex : 06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="res-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Adresse Email (Optionnelle pour le récapitulatif)
              </label>
              <input
                id="res-email"
                type="email"
                placeholder="alexandre@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="res-notes" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Demandes particulières (Terrasse, anniversaire, allergies...)
              </label>
              <textarea
                id="res-notes"
                rows={2}
                placeholder="Précisez ici vos préférences d’emplacement ou intolérances alimentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            {/* Validation Button: Rouge Vin & Blanc */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="text-xs text-zinc-400">
                Confirmation immédiate • Annulation sans frais
              </span>

              <button
                id="btn-submit-reservation"
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <span>Confirmer Ma Réservation</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
}
