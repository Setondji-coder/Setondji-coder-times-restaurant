'use client';

import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole } from '@/lib/supabase';
import {
  getStaffMembers,
  saveStaffMember,
  deleteStaffMember,
} from '@/lib/db-service';
import {
  Users,
  UserPlus,
  Shield,
  ChefHat,
  Wine,
  UserCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';

interface AdminStaffProps {
  onNotify?: (msg: string) => void;
}

const ROLE_LABELS: Record<StaffRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  admin: { label: 'Administrateur Général', icon: Shield, color: 'text-[#D4AF37] bg-[#7D0A1C]/50 border-[#D4AF37]/40' },
  manager: { label: 'Manager / Responsable Salle', icon: UserCheck, color: 'text-blue-400 bg-blue-950/50 border-blue-500/40' },
  cuisine: { label: 'Chef de Cuisine / Brigade', icon: ChefHat, color: 'text-amber-400 bg-amber-950/50 border-amber-500/40' },
  bar: { label: 'Barman / Mixologue / Barista', icon: Wine, color: 'text-purple-400 bg-purple-950/50 border-purple-500/40' },
  salle: { label: 'Serveur / Service en Salle', icon: Users, color: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40' },
};

export function AdminStaff({ onNotify }: AdminStaffProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState<StaffRole>('salle');
  const [actif, setActif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const members = await getStaffMembers();
      setStaffList(members);
    } catch (err) {
      console.error('Erreur chargement personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getStaffMembers()
      .then((members) => {
        if (isMounted) {
          setStaffList(members);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Erreur chargement personnel:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setNom('');
    setEmail('');
    setTelephone('');
    setRole('salle');
    setActif(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setNom(member.nom);
    setEmail(member.email);
    setTelephone(member.telephone || '');
    setRole(member.role);
    setActif(member.actif !== false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) {
      setError('Le nom et l’adresse email sont obligatoires.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await saveStaffMember({
        id: editingStaff?.id,
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        role,
        actif,
        telephone: telephone.trim() || undefined,
      });

      if (editingStaff) {
        setStaffList((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        if (onNotify) onNotify(`Membre du personnel « ${saved.nom} » mis à jour.`);
      } else {
        setStaffList((prev) => [...prev, saved]);
        if (onNotify) onNotify(`Nouveau collaborateur « ${saved.nom} » ajouté.`);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur sauvegarde personnel:', err);
      setError('Impossible d’enregistrer ce collaborateur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l’accès pour « ${name} » ?`)) return;
    try {
      await deleteStaffMember(id);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      if (onNotify) onNotify(`Compte collaborateur « ${name} » supprimé.`);
    } catch (err) {
      console.error('Erreur suppression collaborateur:', err);
    }
  };

  const handleToggleActif = async (member: StaffMember) => {
    try {
      const updated = await saveStaffMember({
        ...member,
        actif: !member.actif,
      });
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (onNotify) {
        onNotify(`Statut de « ${member.nom} » : ${updated.actif ? 'Actif' : 'Désactivé'}.`);
      }
    } catch (err) {
      console.error('Erreur bascule statut collaborateur:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D0A1C]/40 text-[#D4AF37] border border-[#D4AF37]/30">
              <Lock className="h-4 w-4" />
            </span>
            <h2 className="font-serif text-xl font-bold text-white">
              Gestion Sécurisée du Personnel & Rôles
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Cette section est strictement confidentielle et protégée par authentification Supabase.
            Elle n’est jamais exposée aux clients sur l’interface publique du restaurant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStaff}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7D0A1C] hover:bg-[#960D23] text-xs font-bold text-white border border-[#D4AF37]/60 shadow-lg shadow-[#7D0A1C]/40 transition-transform active:scale-95"
          >
            <UserPlus className="h-4 w-4 text-[#D4AF37]" />
            <span>Ajouter un Collaborateur</span>
          </button>
        </div>
      </div>

      {/* Staff members list */}
      <div className="rounded-3xl border border-white/10 bg-[#121216] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="h-8 w-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Chargement des comptes collaborateurs...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-base text-white">Aucun collaborateur enregistré</h3>
            <p className="text-xs text-zinc-500 mt-1">Créez le premier accès pour votre équipe de service ou cuisine.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Collaborateur</th>
                  <th className="py-3.5 px-4">Rôle Attribué</th>
                  <th className="py-3.5 px-4">Coordonnées</th>
                  <th className="py-3.5 px-4 text-center">Statut Accès</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                {staffList.map((member) => {
                  const roleConfig = ROLE_LABELS[member.role] || ROLE_LABELS.salle;
                  const IconComp = roleConfig.icon;
                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-white font-serif font-bold text-sm border border-white/10">
                            {member.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{member.nom}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">ID: {member.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${roleConfig.color}`}
                        >
                          <IconComp className="h-3.5 w-3.5" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Mail className="h-3 w-3 text-zinc-500" />
                          <span>{member.email}</span>
                        </div>
                        {member.telephone && (
                          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                            <Phone className="h-3 w-3 text-zinc-500" />
                            <span>{member.telephone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActif(member)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                            member.actif
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.actif ? 'bg-emerald-400' : 'bg-zinc-500'
                            }`}
                          />
                          <span>{member.actif ? 'Actif' : 'Suspendu'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id, member.nom)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#141418] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7D0A1C]/50 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Shield className="h-4 w-4" />
                </span>
                <h3 className="font-serif font-bold text-base text-white">
                  {editingStaff ? 'Modifier le Collaborateur' : 'Nouveau Compte Personnel'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Koffi Mensah"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Adresse Email Professionnelle *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborateur@timescafe.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Téléphone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+229 01 69 69 86 86"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Rôle & Permissions *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="salle">Serveur / Service en Salle</option>
                  <option value="cuisine">Chef de Cuisine / Brigade</option>
                  <option value="bar">Barman / Barista</option>
                  <option value="manager">Manager / Responsable de Salle</option>
                  <option value="admin">Administrateur Général</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="staff-actif"
                  checked={actif}
                  onChange={(e) => setActif(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <label htmlFor="staff-actif" className="text-xs text-zinc-300">
                  Compte actif (autorisé à accéder aux terminaux opérationnels)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7D0A1C] hover:bg-[#960D23] border border-[#D4AF37]/60 shadow-lg shadow-[#7D0A1C]/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{saving ? 'Enregistrement...' : 'Valider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
