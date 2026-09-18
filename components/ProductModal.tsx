'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/supabase';
import { X, Check, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>;
}

const PRESET_IMAGES: { label: string; url: string; category: Product['categorie'] }[] = [
  { label: 'Espresso Barista', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', category: 'cafe' },
  { label: 'Latte Art & Cappuccino', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80', category: 'cafe' },
  { label: 'Cocktail Fumé Old Fashioned', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', category: 'bar' },
  { label: 'Cocktail Rouge Ruby Sour', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', category: 'bar' },
  { label: 'Verre de Vin Rouge Grand Cru', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', category: 'bar' },
  { label: 'Côte de Bœuf Grillée aux Braises', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', category: 'grill' },
  { label: 'Viande Picanha Braisée', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80', category: 'grill' },
  { label: 'Burger Gourmet Fumé', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', category: 'grill' },
  { label: 'Fondant Cœur Coulant Chocolat', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', category: 'dessert' },
  { label: 'Tiramisu Artisanal Barista', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', category: 'dessert' },
];

function ProductFormContent({
  productToEdit,
  onClose,
  onSave,
}: {
  productToEdit?: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>;
}) {
  const [nom, setNom] = useState(productToEdit?.nom || '');
  const [prix, setPrix] = useState(productToEdit ? productToEdit.prix.toString() : '5000');
  const [categorie, setCategorie] = useState<Product['categorie']>(productToEdit?.categorie || 'grill');
  const [image, setImage] = useState(
    productToEdit?.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  );
  const [dispo, setDispo] = useState(productToEdit?.dispo !== false);
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [tag, setTag] = useState(productToEdit?.tag || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setError('Veuillez renseigner le nom du produit.');
      return;
    }
    const parsedPrice = parseFloat(prix);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Le prix doit être un nombre positif valide.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        nom: nom.trim(),
        prix: parsedPrice,
        categorie,
        image: image.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        dispo,
        description: description.trim(),
        tag: tag.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#121216] p-6 sm:p-7 shadow-2xl my-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C]/40 text-[#D4AF37] border border-[#D4AF37]/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              {productToEdit ? 'Modifier le Produit' : 'Ajouter un Nouvel Article au Menu'}
            </h3>
            <p className="text-xs text-zinc-400">
              Table Produits • TIMES Café Bar & Grill
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-900/30 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Nom & Prix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nom du Produit *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex : Picanha Braisée au Sel de Guérande"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Prix en FCFA *
            </label>
            <input
              type="number"
              step="100"
              min="0"
              required
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="9500"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono"
            />
          </div>
        </div>

        {/* Catégorie & Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Catégorie *
            </label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as Product['categorie'])}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="cafe" className="bg-[#121216]">☕ Côté Café (Barista & Douceurs)</option>
              <option value="bar" className="bg-[#121216]">🍸 Côté Bar (Cocktails & Vins)</option>
              <option value="grill" className="bg-[#121216]">🥩 Côté Grill (Viandes & Braises)</option>
              <option value="dessert" className="bg-[#121216]">🍨 Desserts & Sucrés</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Badge / Tag Spécial (Optionnel)
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="ex : Signature Chef, Bio, Maturation 45j"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Disponibilité (Dispo) Switch */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">
              Statut de Disponibilité (Champ `dispo`)
            </span>
            <span className="text-[11px] text-zinc-400">
              {dispo ? 'Produit actuellement disponible à la commande sur le menu' : 'Produit en rupture de stock temporaire'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDispo(!dispo)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              dispo ? 'bg-[#7D0A1C]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                dispo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Description de la préparation & ingrédients
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détaillez les accords aromatiques, provenance et cuisson..."
            className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Image URL & Presets */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>URL de l’Image du Produit</span>
            <span className="text-[10px] text-[#D4AF37]">Prévisualisation automatique</span>
          </label>
          <div className="flex gap-3 items-start">
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            <div className="h-12 w-16 shrink-0 rounded-lg border border-white/15 overflow-hidden bg-black/80 flex items-center justify-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Aperçu produit" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-4 w-4 text-zinc-600" />
              )}
            </div>
          </div>

          {/* Quick image presets suggestions */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-zinc-500 shrink-0">Suggestions rapides :</span>
            {PRESET_IMAGES.filter((p) => p.category === categorie).slice(0, 3).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImage(preset.url)}
                className="rounded-md bg-white/5 hover:bg-[#7D0A1C]/30 hover:text-white px-2 py-0.5 text-zinc-400 border border-white/10 shrink-0 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] disabled:opacity-50 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#7D0A1C]/30 border border-[#9E1B32] transition-colors"
          >
            <Check className="h-4 w-4 text-[#D4AF37]" />
            <span>{loading ? 'Enregistrement...' : productToEdit ? 'Mettre à jour' : 'Ajouter le Produit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function ProductModal({ isOpen, onClose, productToEdit, onSave }: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <ProductFormContent
        key={productToEdit?.id || 'new-product-modal'}
        productToEdit={productToEdit}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
