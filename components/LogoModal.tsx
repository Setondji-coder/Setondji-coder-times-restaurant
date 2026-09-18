'use client';

import React, { useState } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, X, Check } from 'lucide-react';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLogoUrl: string | null;
  onSaveLogo: (url: string | null) => void;
}

export function LogoModal({ isOpen, onClose, customLogoUrl, onSaveLogo }: LogoModalProps) {
  const [urlInput, setUrlInput] = useState(customLogoUrl || '');
  const [preview, setPreview] = useState<string | null>(customLogoUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, SVG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('L’image ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Veuillez renseigner une adresse URL valide.');
      return;
    }
    setPreview(urlInput.trim());
    setErrorMsg(null);
  };

  const handleConfirm = () => {
    onSaveLogo(preview);
    onClose();
  };

  const handleResetToDefault = () => {
    setPreview(null);
    setUrlInput('');
    onSaveLogo(null);
    onClose();
  };

  return (
    <div 
      id="logo-manager-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#121215] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/30">
              <ImageIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Espace Logo - En-tête</h3>
              <p className="text-xs text-zinc-400">Insérez ou remplacez le logo officiel de TIMES Café Bar & Grill</p>
            </div>
          </div>
          <button
            id="btn-close-logo-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Preview */}
        <div className="my-5 rounded-xl border border-dashed border-[#D4AF37]/40 bg-black/60 p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#D4AF37]">
            Aperçu en direct dans l’en-tête
          </p>
          <div className="flex h-20 items-center justify-center overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Logo TIMES personnalisé"
                className="max-h-16 max-w-[200px] object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#45030c] border border-[#D4AF37]/50 shadow-md">
                  <span className="font-serif text-2xl font-black text-[#D4AF37] tracking-tight">T</span>
                </div>
                <div className="text-left">
                  <div className="font-serif text-xl font-extrabold tracking-widest text-white">TIMES</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Café • Bar • Grill
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="mt-2 inline-block text-[11px] text-zinc-400">
            {preview ? 'Logo personnalisé sélectionné' : 'Emblème typographique par défaut'}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/40 p-2.5 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Upload methods */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Option 1 : Téléverser un fichier logo depuis votre appareil
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-4 px-4 hover:border-[#D4AF37]/50 hover:bg-white/[0.07] transition-all">
              <Upload className="h-6 w-6 text-[#D4AF37] mb-1.5" />
              <span className="text-xs text-white font-medium">Cliquer pour choisir un fichier</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Formats conseillés : PNG transparent, SVG, JPG (Max 5 Mo)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-logo-input"
              />
            </label>
          </div>

          <div>
            <label htmlFor="url-logo-input" className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Option 2 : Insérer via un lien direct (URL d’image)
            </label>
            <div className="flex gap-2">
              <input
                id="url-logo-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/logo-times.png"
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              <button
                id="btn-apply-logo-url"
                type="button"
                onClick={handleUrlApply}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            id="btn-reset-logo-default"
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#D4AF37]" />
            Rétablir l’emblème d’origine
          </button>

          <div className="flex gap-2">
            <button
              id="btn-cancel-logo"
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-save-logo"
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32]/50 transition-colors"
            >
              <Check className="h-3.5 w-3.5 text-[#D4AF37]" />
              Valider le logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

