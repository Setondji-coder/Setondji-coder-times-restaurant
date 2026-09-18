'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur applicative capturée:', error);
    if (typeof window !== 'undefined') {
      const msg = error?.message || '';
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        const last = parseInt(sessionStorage.getItem('error_chunk_reload') || '0', 10);
        const now = Date.now();
        if (now - last > 3000) {
          sessionStorage.setItem('error_chunk_reload', String(now));
          window.location.reload();
        }
      }
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7D0A1C]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#7D0A1C]/40 border border-red-500/40 text-red-300 shadow-xl">
          <AlertTriangle className="h-8 w-8 text-[#D4AF37]" />
        </div>

        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
            Service Temporairement Indisponible
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
            Une interruption est survenue
          </h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            Une erreur inattendue est survenue lors du chargement des services de l&apos;établissement. Veuillez réactualiser ou retourner à la page d&apos;accueil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all"
          >
            <RefreshCw className="h-4 w-4 text-[#D4AF37]" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
