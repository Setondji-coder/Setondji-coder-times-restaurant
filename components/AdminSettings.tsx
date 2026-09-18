'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Phone,
  Store,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Mail,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Scale,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { EstablishmentSettings } from '@/lib/supabase';
import {
  DEFAULT_ESTABLISHMENT_SETTINGS,
  saveSettings,
  subscribeToSettings,
} from '@/lib/db-service';

interface AdminSettingsProps {
  onNotify?: (message: string) => void;
}

export function AdminSettings({ onNotify }: AdminSettingsProps) {
  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_ESTABLISHMENT_SETTINGS);
  const [nomEtablissement, setNomEtablissement] = useState(DEFAULT_ESTABLISHMENT_SETTINGS.nomEtablissement);
  const [whatsappOfficiel, setWhatsappOfficiel] = useState(DEFAULT_ESTABLISHMENT_SETTINGS.whatsappOfficiel);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [telephone, setTelephone] = useState(DEFAULT_ESTABLISHMENT_SETTINGS.telephone || '');
  const [adresse, setAdresse] = useState(DEFAULT_ESTABLISHMENT_SETTINGS.adresse || '');
  const [email, setEmail] = useState(DEFAULT_ESTABLISHMENT_SETTINGS.email || '');

  // Phase 7 : Textes légaux & Conformité
  const [cguCustomText, setCguCustomText] = useState('');
  const [politiqueConfidentialiteCustomText, setPolitiqueConfidentialiteCustomText] = useState('');
  const [reglesAnnulationCustomText, setReglesAnnulationCustomText] = useState('');
  const [dpoEmail, setDpoEmail] = useState('');
  const [legalTab, setLegalTab] = useState<'cgu' | 'privacy' | 'cancel'>('cgu');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time settings
  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      setSettings(data);
      setNomEtablissement(data.nomEtablissement || DEFAULT_ESTABLISHMENT_SETTINGS.nomEtablissement);
      setWhatsappOfficiel(data.whatsappOfficiel || DEFAULT_ESTABLISHMENT_SETTINGS.whatsappOfficiel);
      setLogoPreview(data.logoUrl || null);
      if (data.logoUrl && !data.logoUrl.startsWith('data:')) {
        setLogoUrlInput(data.logoUrl);
      }
      setTelephone(data.telephone || DEFAULT_ESTABLISHMENT_SETTINGS.telephone || '');
      setAdresse(data.adresse || DEFAULT_ESTABLISHMENT_SETTINGS.adresse || '');
      setEmail(data.email || DEFAULT_ESTABLISHMENT_SETTINGS.email || '');
      setCguCustomText(data.cguCustomText || '');
      setPolitiqueConfidentialiteCustomText(data.politiqueConfidentialiteCustomText || '');
      setReglesAnnulationCustomText(data.reglesAnnulationCustomText || '');
      setDpoEmail(data.dpoEmail || '');
    });
    return () => unsub();
  }, []);

  // Process file upload (File to Data URL)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format non supporté. Veuillez sélectionner une image PNG, JPG, WEBP ou SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('L’image dépasse 5 Mo. Veuillez choisir un fichier plus léger.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setLogoUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleApplyUrl = () => {
    if (!logoUrlInput.trim()) {
      setErrorMessage('Veuillez saisir une URL valide.');
      return;
    }
    setLogoPreview(logoUrlInput.trim());
    setErrorMessage(null);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clean WhatsApp number for testing
  const cleanWhatsapp = whatsappOfficiel.replace(/[^0-9]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nomEtablissement.trim()) {
      setErrorMessage('Le nom de l’établissement ne peut pas être vide.');
      return;
    }
    if (!whatsappOfficiel.trim()) {
      setErrorMessage('Le numéro WhatsApp officiel est obligatoire.');
      return;
    }

    try {
      setIsSaving(true);
      await saveSettings({
        nomEtablissement: nomEtablissement.trim(),
        whatsappOfficiel: whatsappOfficiel.trim(),
        logoUrl: logoPreview,
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        email: email.trim(),
        cguCustomText: cguCustomText.trim(),
        politiqueConfidentialiteCustomText: politiqueConfidentialiteCustomText.trim(),
        reglesAnnulationCustomText: reglesAnnulationCustomText.trim(),
        dpoEmail: dpoEmail.trim(),
        legalLastUpdated: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      });

      setSaveSuccess(true);
      if (onNotify) {
        onNotify('Paramètres de l’établissement enregistrés et synchronisés avec succès.');
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err);
      setErrorMessage('Une erreur est survenue lors de l’enregistrement. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7D0A1C]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7D0A1C]/30 border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37]">
              <Settings className="h-3.5 w-3.5" />
              <span>Configuration Officielle</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Paramètres de l’Établissement
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Personnalisez l’identité de votre restaurant : le nom affiché sur le site et les reçus,
              le numéro WhatsApp pour la réception des commandes et du support, ainsi que le logo officiel.
            </p>
          </div>

          {/* Quick live preview badge */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-black/60 border border-white/10 p-3.5 shrink-0">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#3B040B] border border-[#D4AF37]/50 shadow-md overflow-hidden shrink-0">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt={nomEtablissement}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="font-serif text-2xl font-black text-[#D4AF37]">
                  {nomEtablissement.charAt(0) || 'T'}
                </span>
              )}
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white max-w-[180px] truncate">
                {nomEtablissement || 'TIMES Café Bar & Grill'}
              </div>
              <div className="text-[11px] font-mono text-[#D4AF37] mt-0.5">
                {whatsappOfficiel || '+229 01 69 69 86 86'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/50 p-4 text-xs sm:text-sm text-emerald-200 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Vos modifications ont été enregistrées et appliquées en temps réel sur toute la plateforme !</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-red-950/40 border border-red-500/50 p-4 text-xs sm:text-sm text-red-200 flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: Identité & WhatsApp */}
          <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C]/40 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Identité & Contact Officiel
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Visible par les clients sur le menu, l’en-tête et les reçus de caisse
                </p>
              </div>
            </div>

            {/* Nom de l'établissement */}
            <div className="space-y-2">
              <label htmlFor="setting-nom" className="block text-xs font-semibold text-zinc-300">
                Nom officiel de l’établissement <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                id="setting-nom"
                type="text"
                required
                value={nomEtablissement}
                onChange={(e) => setNomEtablissement(e.target.value)}
                placeholder="Ex: TIMES Café Bar & Grill"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              <p className="text-[11px] text-zinc-500">
                Ce nom est repris dans la barre de navigation, le pied de page et les reçus fiscaux numériques.
              </p>
            </div>

            {/* Numéro WhatsApp officiel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="setting-whatsapp" className="block text-xs font-semibold text-zinc-300">
                  Numéro WhatsApp officiel <span className="text-[#D4AF37]">*</span>
                </label>
                {cleanWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=Bonjour%20depuis%20l'espace%20administration%20TIMES`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                    title="Ouvrir une discussion test sur WhatsApp Web / App"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Tester le lien WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-zinc-400">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <input
                  id="setting-whatsapp"
                  type="text"
                  required
                  value={whatsappOfficiel}
                  onChange={(e) => setWhatsappOfficiel(e.target.value)}
                  placeholder="Ex: +229 01 69 69 86 86"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-11 pr-4 py-3 text-sm text-white font-mono placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                Format international recommandé avec indicatif pays (ex: <code>+229</code> pour le Bénin). Utilisé pour les partages de commandes et le contact direct.
              </p>
            </div>

            {/* Coordonnées additionnelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="space-y-1.5">
                <label htmlFor="setting-telephone" className="block text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-[#D4AF37]" />
                  Téléphone fixe / standard
                </label>
                <input
                  id="setting-telephone"
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+229 01 69 69 86 86 / +229 01 91 49 33 33"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="setting-email" className="block text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-[#D4AF37]" />
                  Email de contact
                </label>
                <input
                  id="setting-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="timeslesmoments@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-adresse" className="block text-xs font-medium text-zinc-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#D4AF37]" />
                Adresse physique de l’établissement
              </label>
              <input
                id="setting-adresse"
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="12 Avenue des Arts & Gourmandises, 75008 Paris"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: Importation & Gestion du Logo */}
          <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C]/40 border border-[#D4AF37]/30 text-[#D4AF37]">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      Logo Officiel
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Importez le blason ou le visuel officiel de l’enseigne
                    </p>
                  </div>
                </div>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 transition-colors"
                    title="Supprimer le logo personnalisé et rétablir le logo par défaut"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Rétablir défaut</span>
                  </button>
                )}
              </div>

              {/* Upload Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? 'border-[#D4AF37] bg-[#7D0A1C]/20 scale-[1.01]'
                    : 'border-white/15 bg-black/40 hover:border-[#D4AF37]/60 hover:bg-black/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-file-input"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7D0A1C]/30 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      Glissez-déposez votre logo ici ou <span className="text-[#D4AF37] underline">parcourez vos fichiers</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Formats supportés : PNG transparent, SVG, JPG, WEBP (Max 5 Mo)
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative: Image URL */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-zinc-400">
                  Ou saisissez directement l’URL d’une image hébergée :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://mon-domaine.fr/images/logo.png"
                    className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold border border-white/15 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>

              {/* Live Mockup Preview in Real Context */}
              <div className="rounded-2xl bg-black/60 border border-[#D4AF37]/30 p-4 space-y-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Aperçu en temps réel dans l’en-tête du restaurant</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#09090B] border border-white/10">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D0A1C] to-[#3B040B] border border-[#D4AF37]/50 shadow overflow-hidden">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-serif text-2xl font-black text-[#D4AF37]">
                        {nomEtablissement.charAt(0) || 'T'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-serif text-base font-black tracking-widest text-white uppercase">
                      {nomEtablissement.split(' ')[0] || 'TIMES'}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                      {nomEtablissement.split(' ').slice(1).join(' ') || 'Café • Bar • Grill'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last updated timestamp */}
            {settings.updatedAt && (
              <div className="text-[11px] text-zinc-500 pt-2 border-t border-white/5">
                Dernière mise à jour : {new Date(settings.updatedAt).toLocaleString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4 : CONFORMITÉ & TEXTES JURIDIQUES (PHASE 7)    */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D0A1C]/40 text-[#D4AF37] border border-[#9E1B32]">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  4. Conformité & Textes Juridiques (Phase 7)
                </h3>
                <p className="text-xs text-zinc-400">
                  Personnalisez les CGU / CGV, la Politique de Confidentialité et les règles d&apos;annulation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/cgu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Voir CGU/CGV</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href="/confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Voir Confidentialité</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setLegalTab('cgu')}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                legalTab === 'cgu'
                  ? 'bg-[#7D0A1C] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Conditions Générales (CGU / CGV)
            </button>
            <button
              type="button"
              onClick={() => setLegalTab('privacy')}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                legalTab === 'privacy'
                  ? 'bg-[#7D0A1C] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Politique de Confidentialité & DPO
            </button>
            <button
              type="button"
              onClick={() => setLegalTab('cancel')}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                legalTab === 'cancel'
                  ? 'bg-[#7D0A1C] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Règles d&apos;Annulation Cuisine
            </button>
          </div>

          {/* Tab 1: CGU / CGV */}
          {legalTab === 'cgu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Dispositions Particulières & Clauses CGU / CGV
                </label>
                <span className="text-[11px] text-zinc-500">
                  S&apos;affiche en en-tête de la page /cgu
                </span>
              </div>
              <textarea
                rows={5}
                value={cguCustomText}
                onChange={(e) => setCguCustomText(e.target.value)}
                placeholder="Ajoutez ici des dispositions contractuelles spécifiques à votre établissement (ex: conditions de privatisation, suppléments événementiels, règles de terrasse nocturne...)"
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none leading-relaxed"
              />
              <div className="rounded-xl bg-black/30 border border-white/5 p-3 text-[11px] text-zinc-400 flex items-start gap-2">
                <FileText className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  Les articles fondamentaux (encaissements Mobile Money FedaPay / KKiaPay, reçu numérique infalsifiable, 14 allergènes HACCP et tribunal de commerce) sont automatiquement maintenus en vigueur.
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Politique de Confidentialité */}
          {legalTab === 'privacy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                    E-mail officiel DPO (Protection des Données)
                  </label>
                  <input
                    type="email"
                    value={dpoEmail}
                    onChange={(e) => setDpoEmail(e.target.value)}
                    placeholder="privacy@times-cafebargrill.fr"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Adresse transmise aux clients pour leurs demandes de droit d&apos;accès et d&apos;effacement.
                  </span>
                </div>

                <div className="rounded-xl bg-black/30 border border-white/5 p-3 text-[11px] text-zinc-400">
                  <span className="text-white font-bold block mb-1">Rappel de Sécurité Bancaire :</span>
                  TIMES Café Bar & Grill ne stocke aucun numéro de carte ni code PIN Mobile Money. L&apos;ensemble des données financières sensibles est chiffré par FedaPay et KKiaPay.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Clauses Spécifiques de Confidentialité (facultatif)
                </label>
                <textarea
                  rows={4}
                  value={politiqueConfidentialiteCustomText}
                  onChange={(e) => setPolitiqueConfidentialiteCustomText(e.target.value)}
                  placeholder="Mentions complémentaires sur la vidéosurveillance de la salle, registres de sécurité ou sous-traitants logistiques..."
                  className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Règles d'Annulation */}
          {legalTab === 'cancel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Notice d&apos;Annulation Cuisine & Bar (Panier & KDS)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setReglesAnnulationCustomText(
                      "Toute commande est définitive et non annulable dès lors que la cuisine ou le bar passe le statut à « En préparation » (matières premières engagées et cuissons minute au feu de bois)."
                    )
                  }
                  className="text-[11px] text-[#D4AF37] hover:underline"
                >
                  Charger la mention recommandée
                </button>
              </div>

              <textarea
                rows={3}
                value={reglesAnnulationCustomText}
                onChange={(e) => setReglesAnnulationCustomText(e.target.value)}
                placeholder="Toute commande est définitive et non annulable dès lors que la cuisine ou le bar passe le statut à « En préparation » (matières premières engagées et cuissons minute au feu de bois)."
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none leading-relaxed"
              />

              <div className="rounded-xl bg-[#7D0A1C]/20 border border-[#9E1B32]/50 p-3 text-xs text-zinc-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Cette clause est cruciale pour prémunir le restaurant contre les désistements abusifs une fois les viandes nobles (Angus braisé, T-Bone, côtes de bœuf) déjà saisies par les maîtres grilladins.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions Bar */}
        <div className="rounded-2xl bg-[#121216] border border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            <span className="text-[#D4AF37] font-semibold">Note :</span> Les modifications seront appliquées instantanément sur l’interface publique, les reçus et le terminal cuisine.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setNomEtablissement(DEFAULT_ESTABLISHMENT_SETTINGS.nomEtablissement);
                setWhatsappOfficiel(DEFAULT_ESTABLISHMENT_SETTINGS.whatsappOfficiel);
                setLogoPreview(null);
                setTelephone(DEFAULT_ESTABLISHMENT_SETTINGS.telephone || '');
                setAdresse(DEFAULT_ESTABLISHMENT_SETTINGS.adresse || '');
                setEmail(DEFAULT_ESTABLISHMENT_SETTINGS.email || '');
                setCguCustomText('');
                setPolitiqueConfidentialiteCustomText('');
                setReglesAnnulationCustomText('');
                setDpoEmail('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Valeurs par défaut
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] disabled:opacity-50 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-[#7D0A1C]/40 border border-[#9E1B32] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 text-[#D4AF37] animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#D4AF37]" />
                  <span>Enregistrer les Paramètres</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
