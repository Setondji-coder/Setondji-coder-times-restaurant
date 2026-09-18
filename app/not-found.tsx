import Link from 'next/link';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow décoratif */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7D0A1C]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#7D0A1C]/40 border border-[#D4AF37]/50 text-[#D4AF37] shadow-xl">
          <Sparkles className="h-8 w-8" />
        </div>

        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
            Erreur 404 • Page Introuvable
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-2">
            Table Non Trouvée
          </h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            La page ou la ressource que vous recherchez semble introuvable ou a été déplacée. Notre équipe en salle vous invite à retourner à l&apos;accueil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all"
          >
            <Home className="h-4 w-4 text-[#D4AF37]" />
            <span>Retour à l&apos;Accueil</span>
          </Link>
          <Link
            href="/#carte"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Consulter la Carte</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
