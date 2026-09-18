'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Experience } from '@/components/Experience';
import { MenuSection } from '@/components/MenuSection';
import { ReservationSection } from '@/components/ReservationSection';
import { EventsHoursSection } from '@/components/EventsHoursSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  const scrollToReservation = () => {
    const el = document.getElementById('reservation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-[#7D0A1C] selection:text-white">
      {/* Navigation En-tête avec Espace Logo Dédié */}
      <Header onOpenReservation={scrollToReservation} />

      {/* Hero Principal avec Thème Sombre, Rouge Vin & Jaune Doré */}
      <Hero onOpenReservation={scrollToReservation} />

      {/* Les 3 Univers : Café de Spécialité, Bar à Cocktails, Grill au Feu de Bois */}
      <Experience />

      {/* Carte Complète & Spécialités */}
      <MenuSection />

      {/* Soirées, Événements & Horaires d'Ouverture */}
      <EventsHoursSection />

      {/* Module de Réservation Responsive Instantané */}
      <ReservationSection />

      {/* Pied de Page / Coordonnées & Club Privilège */}
      <Footer />
    </main>
  );
}
