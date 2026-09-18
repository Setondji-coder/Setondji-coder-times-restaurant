'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import {
  subscribeToSettings,
  DEFAULT_ESTABLISHMENT_SETTINGS,
} from '@/lib/db-service';
import { EstablishmentSettings } from '@/lib/supabase';

interface HeaderProps {
  onOpenReservation?: () => void;
}

export function Header({ onOpenReservation }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'L’Expérience', href: '#experience' },
    { label: 'La Carte', href: '#carte' },
    { label: 'Ambiance & Événements', href: '#evenements' },
    { label: 'Horaires & Accès', href: '#contact' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090B]/95 backdrop-blur-md py-3 border-b border-white/10 shadow-2xl shadow-black/80'
          : 'bg-gradient-to-b from-[#09090B]/90 via-[#09090B]/60 to-transparent py-5 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Identité Officielle du Restaurant */}
          <Link
            href="/"
            id="header-brand-link"
            className="flex items-center gap-2 group focus:outline-none"
          >
            {/* Typographie de marque */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-black tracking-widest text-white uppercase group-hover:text-[#D4AF37] transition-colors">
                  {settings.nomEtablissement?.split(' ')[0] || 'TIMES'}
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                {settings.nomEtablissement?.split(' ').slice(1).join(' ') || 'Café • Bar • Grill'}
              </div>
            </div>
          </Link>

          {/* Navigation Principale (Desktop) */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative group"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions Publiques */}
          <div className="flex items-center gap-2.5">
            {/* Téléphone officiel */}
            {settings.telephone && (
              <a
                id="btn-header-phone"
                href={`tel:${settings.telephone.replace(/[^0-9+]/g, '')}`}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D4AF37] bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="font-mono">{settings.telephone}</span>
              </a>
            )}

            {/* Bouton de Réservation */}
            <a
              id="btn-header-reservation"
              href="#reservation"
              onClick={() => onOpenReservation?.()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32]/60 hover:shadow-[#7D0A1C]/50 transition-all duration-200"
            >
              <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Réserver</span>
            </a>

            {/* Mobile Menu Trigger */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Ouvrir le menu de navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-[#D4AF37]" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Mobile (Public) */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="lg:hidden fixed inset-x-0 top-[65px] bg-[#09090B]/98 border-b border-white/15 px-6 py-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto"
        >
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-base font-medium text-zinc-200 hover:text-[#D4AF37] border-b border-white/5"
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#D4AF37]">→</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <a
              href="#reservation"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation?.();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] py-3 text-sm font-bold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32]"
            >
              <Calendar className="h-4 w-4 text-[#D4AF37]" />
              Réserver une Table
            </a>

            {settings.telephone && (
              <a
                href={`tel:${settings.telephone.replace(/[^0-9+]/g, '')}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-medium text-zinc-300"
              >
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Appeler le {settings.telephone}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
