import { supabase, Product, Order, EstablishmentSettings, StaffMember, StaffRole } from './supabase';

export const DEFAULT_ESTABLISHMENT_SETTINGS: EstablishmentSettings = {
  nomEtablissement: 'TIMES Café Bar & Grill',
  whatsappOfficiel: '+229 01 69 69 86 86',
  logoUrl: null,
  telephone: '+229 01 69 69 86 86 / +229 01 91 49 33 33',
  adresse: 'Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad.\nCotonou — Bénin',
  email: 'timeslesmoments@gmail.com',
  devisePrincipale: 'FCFA',
};

// Initial default seed products (Tous les prix strictement en FCFA)
export const DEFAULT_INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    nom: 'Espresso Single Origin Éthiopie Yirgacheffe',
    prix: 2500,
    categorie: 'cafe',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Extraction précise, notes florales de jasmin et bergamote, torréfaction artisanale maison.',
    tag: 'Signature Barista',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Flat White Velours & Lait d’Avoine',
    prix: 3500,
    categorie: 'cafe',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Double ristretto dense, micro-mousse onctueuse et latte art soigné.',
    tag: 'Coup de cœur',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Cold Brew TIMES Infusion 18h',
    prix: 4000,
    categorie: 'cafe',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Café glacé infusé à froid goutte à goutte, servi avec zeste d’orange flambé.',
    tag: 'Fait Maison',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Old Fashioned Fumé au Bois de Barrique',
    prix: 9500,
    categorie: 'bar',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Bourbon vieilli en fût de chêne, bitter maison aux écorces d’orange et fumage minute.',
    tag: 'Cocktail Signature',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'TIMES Ruby Sour & Vin de Bordeaux',
    prix: 9000,
    categorie: 'bar',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Rye whiskey, citron pressé, sirop de canne et réduction de vin rouge Merlot.',
    tag: 'Création Maison',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Saint-Émilion Grand Cru 2019',
    prix: 8000,
    categorie: 'bar',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Notes de cerise noire mûre, tanins soyeux, élevage soigné en fût de chêne.',
    tag: 'Sélection Sommelier',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Côte de Bœuf Maturée 45 Jours (Pour 2)',
    prix: 55000,
    categorie: 'grill',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Race Angus sélectionnée, saisie à la flamme vive puis cuite sur braises de hêtre avec os à moelle.',
    tag: 'Chef Signature',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Picanha Braisée au Sel de Guérande',
    prix: 18500,
    categorie: 'grill',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Tranchée minute, fondante et croustillante, accompagnée de chimichurri fumé.',
    tag: 'Spécialité Braise',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Burger TIMES Black Angus & Confit au Vin Rouge',
    prix: 14500,
    categorie: 'grill',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Steak 180g grillé minute, bacon croustillant fumé, confit d’oignons au vin rouge, pain brioché toasté.',
    tag: 'Best-Seller',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Fondant Cœur Coulant Chocolat Noir & Piment',
    prix: 6000,
    categorie: 'dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Chocolat 72% Guanaja, glace artisanale à la vanille Bourbon de Madagascar et coulis de framboise.',
    tag: 'Gourmandise',
    createdAt: new Date().toISOString(),
  },
  {
    nom: 'Tiramisu Barista au Café TIMES',
    prix: 5500,
    categorie: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
    dispo: true,
    description: 'Biscuits cuillère imbibés de notre espresso Yirgacheffe, crème mascarpone aérée, cacao brut.',
    tag: 'Recette Maison',
    createdAt: new Date().toISOString(),
  },
];

// Helper to convert database row (snake_case) to Product interface
function mapRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id || ''),
    nom: String(row.nom || ''),
    prix: Number(row.prix) || 0,
    categorie: (row.categorie as Product['categorie']) || 'cafe',
    image: String(row.image || ''),
    dispo: row.dispo !== false,
    description: row.description ? String(row.description) : undefined,
    tag: row.tag ? String(row.tag) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

// Helper to convert database row to Order interface
function mapRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id || ''),
    items: Array.isArray(row.items) ? (row.items as Order['items']) : [],
    total: Number(row.total) || 0,
    totalXof: row.total_xof ? Number(row.total_xof) : Number(row.total) || 0,
    customerName: String(row.customer_name || ''),
    customerPhone: String(row.customer_phone || ''),
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,
    consumptionMode: (row.consumption_mode as Order['consumptionMode']) || 'sur_place',
    tableNumber: row.table_number ? String(row.table_number) : undefined,
    pickupTime: row.pickup_time ? String(row.pickup_time) : undefined,
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    deliveryCity: row.delivery_city ? String(row.delivery_city) : undefined,
    deliveryNotes: row.delivery_notes ? String(row.delivery_notes) : undefined,
    status: (row.status as Order['status']) || 'Commande en cours',
    notes: row.notes ? String(row.notes) : undefined,
    tableOrRoom: row.table_or_room ? String(row.table_or_room) : undefined,
    paymentStatus: row.payment_status ? (row.payment_status as Order['paymentStatus']) : undefined,
    paymentProvider: row.payment_provider ? (row.payment_provider as Order['paymentProvider']) : undefined,
    paymentMethod: row.payment_method ? String(row.payment_method) : undefined,
    paymentReference: row.payment_reference ? String(row.payment_reference) : undefined,
    paymentDate: row.payment_date ? String(row.payment_date) : undefined,
    receiptNumber: row.receipt_number ? String(row.receipt_number) : undefined,
    currency: 'XOF',
    amountPaid: row.amount_paid ? Number(row.amount_paid) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

// Helper to convert database row to Settings
function mapRowToSettings(row: Record<string, unknown>): EstablishmentSettings {
  return {
    nomEtablissement: String(row.nom_etablissement || DEFAULT_ESTABLISHMENT_SETTINGS.nomEtablissement),
    whatsappOfficiel: String(row.whatsapp_officiel || DEFAULT_ESTABLISHMENT_SETTINGS.whatsappOfficiel),
    logoUrl: row.logo_url ? String(row.logo_url) : null,
    telephone: String(row.telephone || DEFAULT_ESTABLISHMENT_SETTINGS.telephone),
    adresse: String(row.adresse || DEFAULT_ESTABLISHMENT_SETTINGS.adresse),
    email: String(row.email || DEFAULT_ESTABLISHMENT_SETTINGS.email),
    devisePrincipale: 'FCFA',
    cguCustomText: row.cgu_custom_text ? String(row.cgu_custom_text) : undefined,
    politiqueConfidentialiteCustomText: row.politique_confidentialite_custom_text ? String(row.politique_confidentialite_custom_text) : undefined,
    reglesAnnulationCustomText: row.regles_annulation_custom_text ? String(row.regles_annulation_custom_text) : undefined,
    dpoEmail: row.dpo_email ? String(row.dpo_email) : undefined,
    legalLastUpdated: row.legal_last_updated ? String(row.legal_last_updated) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

// ==========================================
// PRODUITS (SUPABASE POSTGRESQL + REALTIME)
// ==========================================

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  let isMounted = true;

  // Local storage fallback for instant response
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('times_supabase_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          callback(parsed);
        }
      }
    } catch {
      // ignore
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nom');

      if (!isMounted) return;

      if (error || !data || data.length === 0) {
        // Check local cache or use default initial products
        let fallbackProds: Product[] = [];
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('times_supabase_products');
          if (cached) {
            fallbackProds = JSON.parse(cached);
          }
        }
        if (fallbackProds.length === 0) {
          fallbackProds = DEFAULT_INITIAL_PRODUCTS.map((p, idx) => ({
            ...p,
            id: `prod-init-${idx + 1}`,
          }));
        }
        callback(fallbackProds);
      } else {
        const mapped = data.map(mapRowToProduct);
        if (typeof window !== 'undefined') {
          localStorage.setItem('times_supabase_products', JSON.stringify(mapped));
        }
        callback(mapped);
      }
    } catch (err) {
      console.warn('Erreur Supabase fetch products:', err);
      if (isMounted) {
        const fallbackProds = DEFAULT_INITIAL_PRODUCTS.map((p, idx) => ({
          ...p,
          id: `prod-init-${idx + 1}`,
        }));
        callback(fallbackProds);
      }
    }
  };

  fetchProducts();

  // Supabase Realtime channel
  const channel = supabase
    .channel('public:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      fetchProducts();
    })
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };
}

export async function seedInitialProductsIfEmpty(): Promise<number> {
  try {
    const { data } = await supabase.from('products').select('id').limit(1);
    if (!data || data.length === 0) {
      const rows = DEFAULT_INITIAL_PRODUCTS.map((item) => ({
        nom: item.nom,
        prix: item.prix,
        categorie: item.categorie,
        image: item.image,
        dispo: item.dispo,
        description: item.description,
        tag: item.tag,
      }));

      const { data: inserted, error } = await supabase.from('products').insert(rows).select();
      if (error) {
        console.warn('Erreur insertion Supabase seed:', error);
      }
      return inserted?.length || rows.length;
    }
    return 0;
  } catch (err) {
    console.warn('Erreur seedInitialProductsIfEmpty:', err);
    return DEFAULT_INITIAL_PRODUCTS.length;
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          nom: product.nom,
          prix: product.prix,
          categorie: product.categorie,
          image: product.image,
          dispo: product.dispo ?? true,
          description: product.description,
          tag: product.tag,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Erreur addProduct Supabase:', error);
    }
    return data?.id || `prod-${Date.now()}`;
  } catch {
    return `prod-${Date.now()}`;
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (product.nom !== undefined) updatePayload.nom = product.nom;
    if (product.prix !== undefined) updatePayload.prix = product.prix;
    if (product.categorie !== undefined) updatePayload.categorie = product.categorie;
    if (product.image !== undefined) updatePayload.image = product.image;
    if (product.dispo !== undefined) updatePayload.dispo = product.dispo;
    if (product.description !== undefined) updatePayload.description = product.description;
    if (product.tag !== undefined) updatePayload.tag = product.tag;

    await supabase.from('products').update(updatePayload).eq('id', id);
  } catch (err) {
    console.warn('Erreur updateProduct Supabase:', err);
  }
}

export async function toggleProductDispo(id: string, currentDispo: boolean): Promise<void> {
  try {
    await supabase
      .from('products')
      .update({ dispo: !currentDispo, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (err) {
    console.warn('Erreur toggleProductDispo Supabase:', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err) {
    console.warn('Erreur deleteProduct Supabase:', err);
  }
}

// ==========================================
// COMMANDES (SUPABASE POSTGRESQL + REALTIME)
// ==========================================

export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  let isMounted = true;

  // Local storage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('times_supabase_orders');
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (!error && data) {
        const mapped = data.map(mapRowToOrder);
        if (typeof window !== 'undefined') {
          localStorage.setItem('times_supabase_orders', JSON.stringify(mapped));
        }
        callback(mapped);
      }
    } catch (err) {
      console.warn('Erreur subscribeToOrders Supabase:', err);
    }
  };

  fetchOrders();

  const channel = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchOrders();
    })
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };
}

export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt'> & { createdAt?: string }
): Promise<string> {
  const generatedId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = order.createdAt || new Date().toISOString();

  try {
    const payload = {
      items: order.items,
      total: order.total,
      total_xof: order.totalXof || order.total,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail,
      consumption_mode: order.consumptionMode,
      table_number: order.tableNumber,
      pickup_time: order.pickupTime,
      delivery_address: order.deliveryAddress,
      delivery_city: order.deliveryCity,
      delivery_notes: order.deliveryNotes,
      status: order.status,
      notes: order.notes,
      table_or_room: order.tableOrRoom,
      payment_status: order.paymentStatus || 'en_attente',
      payment_provider: order.paymentProvider,
      payment_method: order.paymentMethod,
      payment_reference: order.paymentReference,
      payment_date: order.paymentDate,
      receipt_number: order.receiptNumber,
      currency: 'XOF',
      amount_paid: order.amountPaid || order.total,
      created_at: createdAt,
    };

    const { data, error } = await supabase.from('orders').insert([payload]).select().single();

    // Cache to localStorage for client access
    if (typeof window !== 'undefined') {
      try {
        const existing = localStorage.getItem('times_supabase_orders');
        const ordersList: Order[] = existing ? JSON.parse(existing) : [];
        const newOrder: Order = {
          ...order,
          id: data?.id || generatedId,
          createdAt,
        };
        ordersList.unshift(newOrder);
        localStorage.setItem('times_supabase_orders', JSON.stringify(ordersList.slice(0, 100)));
      } catch {
        // ignore
      }
    }

    if (error) {
      console.warn('Avis insertion commande Supabase:', error);
    }

    return data?.id || generatedId;
  } catch (err) {
    console.warn('Erreur createOrder Supabase:', err);
    return generatedId;
  }
}

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): () => void {
  let isMounted = true;

  const fetchSingle = async () => {
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      if (!isMounted) return;
      if (data) {
        callback(mapRowToOrder(data));
      } else {
        // Fallback local storage
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('times_supabase_orders');
          if (cached) {
            const list: Order[] = JSON.parse(cached);
            const found = list.find((o) => o.id === orderId);
            callback(found || null);
            return;
          }
        }
        callback(null);
      }
    } catch {
      if (isMounted) callback(null);
    }
  };

  fetchSingle();

  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      () => {
        fetchSingle();
      }
    )
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('times_supabase_orders');
        if (cached) {
          const list: Order[] = JSON.parse(cached);
          const updated = list.map((o) => (o.id === orderId ? { ...o, status } : o));
          localStorage.setItem('times_supabase_orders', JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('Erreur updateOrderStatus Supabase:', err);
  }
}

export async function updateOrderPayment(
  orderId: string,
  paymentData: Partial<Order>
): Promise<void> {
  try {
    const payload: Record<string, unknown> = {};
    if (paymentData.paymentStatus !== undefined) payload.payment_status = paymentData.paymentStatus;
    if (paymentData.paymentProvider !== undefined) payload.payment_provider = paymentData.paymentProvider;
    if (paymentData.paymentMethod !== undefined) payload.payment_method = paymentData.paymentMethod;
    if (paymentData.paymentReference !== undefined) payload.payment_reference = paymentData.paymentReference;
    if (paymentData.paymentDate !== undefined) payload.payment_date = paymentData.paymentDate;
    if (paymentData.receiptNumber !== undefined) payload.receipt_number = paymentData.receiptNumber;
    if (paymentData.amountPaid !== undefined) payload.amount_paid = paymentData.amountPaid;

    await supabase.from('orders').update(payload).eq('id', orderId);
  } catch (err) {
    console.warn('Erreur updateOrderPayment Supabase:', err);
  }
}

// ==========================================
// PARAMÈTRES (SUPABASE POSTGRESQL + REALTIME)
// ==========================================

export function subscribeToSettings(
  callback: (settings: EstablishmentSettings) => void
): () => void {
  let isMounted = true;

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('times_establishment_settings');
      if (cached) {
        callback({ ...DEFAULT_ESTABLISHMENT_SETTINGS, ...JSON.parse(cached) });
      } else {
        callback(DEFAULT_ESTABLISHMENT_SETTINGS);
      }
    } catch {
      callback(DEFAULT_ESTABLISHMENT_SETTINGS);
    }
  }

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('establishment_settings')
        .select('*')
        .eq('id', 'general')
        .maybeSingle();

      if (!isMounted) return;

      if (data) {
        const mapped = mapRowToSettings(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('times_establishment_settings', JSON.stringify(mapped));
        }
        callback(mapped);
      }
    } catch (err) {
      console.warn('Erreur fetchSettings Supabase:', err);
    }
  };

  fetchSettings();

  const channel = supabase
    .channel('public:establishment_settings')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'establishment_settings', filter: 'id=eq.general' },
      () => {
        fetchSettings();
      }
    )
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };
}

export async function getSettings(): Promise<EstablishmentSettings> {
  try {
    const { data } = await supabase
      .from('establishment_settings')
      .select('*')
      .eq('id', 'general')
      .maybeSingle();

    if (data) {
      return mapRowToSettings(data);
    }
  } catch (err) {
    console.warn('Erreur getSettings Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('times_establishment_settings');
      if (cached) return { ...DEFAULT_ESTABLISHMENT_SETTINGS, ...JSON.parse(cached) };
    } catch {
      // ignore
    }
  }
  return DEFAULT_ESTABLISHMENT_SETTINGS;
}

export async function saveSettings(settings: Partial<EstablishmentSettings>): Promise<void> {
  const updatedData: EstablishmentSettings = {
    ...DEFAULT_ESTABLISHMENT_SETTINGS,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // Sync to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('times_establishment_settings', JSON.stringify(updatedData));
    } catch {
      // ignore
    }
  }

  try {
    const payload = {
      id: 'general',
      nom_etablissement: updatedData.nomEtablissement,
      whatsapp_officiel: updatedData.whatsappOfficiel,
      logo_url: updatedData.logoUrl,
      telephone: updatedData.telephone,
      adresse: updatedData.adresse,
      email: updatedData.email,
      devise_principale: 'FCFA',
      taux_conversion_eur_xof: 655.957,
      cgu_custom_text: updatedData.cguCustomText,
      politique_confidentialite_custom_text: updatedData.politiqueConfidentialiteCustomText,
      regles_annulation_custom_text: updatedData.reglesAnnulationCustomText,
      dpo_email: updatedData.dpoEmail,
      legal_last_updated: updatedData.legalLastUpdated,
      updated_at: updatedData.updatedAt,
    };

    await supabase.from('establishment_settings').upsert(payload);
  } catch (err) {
    console.warn('Erreur saveSettings Supabase:', err);
  }
}

// =========================================================================
// GESTION DU PERSONNEL ET DES RÔLES (ESPACE SÉCURISÉ & PRIVÉ UNIQUEMENT)
// =========================================================================

export const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    nom: 'Direction & Administration',
    email: 'admin@times-cafebargrill.bj',
    role: 'admin',
    actif: true,
    telephone: '+229 97 00 00 01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    nom: 'Chef de Brigade Cuisine',
    email: 'cuisine@times-cafebargrill.bj',
    role: 'cuisine',
    actif: true,
    telephone: '+229 97 00 00 02',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-3',
    nom: 'Chef Barman & Mixologie',
    email: 'bar@times-cafebargrill.bj',
    role: 'bar',
    actif: true,
    telephone: '+229 97 00 00 03',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-4',
    nom: 'Maître d’Hôtel & Responsable Salle',
    email: 'salle@times-cafebargrill.bj',
    role: 'salle',
    actif: true,
    telephone: '+229 97 00 00 04',
    createdAt: new Date().toISOString(),
  },
];

export async function getStaffMembers(): Promise<StaffMember[]> {
  try {
    const { data, error } = await supabase.from('staff_members').select('*').order('nom');
    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: String(row.id),
        nom: String(row.nom),
        email: String(row.email),
        role: row.role as StaffRole,
        actif: row.actif !== false,
        telephone: row.telephone ? String(row.telephone) : undefined,
        createdAt: row.created_at ? String(row.created_at) : undefined,
        derniereConnexion: row.derniere_connexion ? String(row.derniere_connexion) : undefined,
      }));
    }
  } catch (err) {
    console.warn('Erreur getStaffMembers Supabase:', err);
  }

  // Fallback local storage for secured admin session
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('times_staff_members_secure');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return DEFAULT_STAFF_MEMBERS;
}

export async function saveStaffMember(staff: Omit<StaffMember, 'id'> & { id?: string }): Promise<StaffMember> {
  const newStaff: StaffMember = {
    id: staff.id || `staff-${Date.now()}`,
    nom: staff.nom,
    email: staff.email,
    role: staff.role,
    actif: staff.actif ?? true,
    telephone: staff.telephone,
    createdAt: staff.createdAt || new Date().toISOString(),
  };

  try {
    await supabase.from('staff_members').upsert({
      id: newStaff.id,
      nom: newStaff.nom,
      email: newStaff.email,
      role: newStaff.role,
      actif: newStaff.actif,
      telephone: newStaff.telephone,
    });
  } catch (err) {
    console.warn('Erreur saveStaffMember Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const current = await getStaffMembers();
      const updated = current.filter((s) => s.id !== newStaff.id).concat(newStaff);
      localStorage.setItem('times_staff_members_secure', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newStaff;
}

export async function deleteStaffMember(id: string): Promise<void> {
  try {
    await supabase.from('staff_members').delete().eq('id', id);
  } catch (err) {
    console.warn('Erreur deleteStaffMember Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const current = await getStaffMembers();
      const updated = current.filter((s) => s.id !== id);
      localStorage.setItem('times_staff_members_secure', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}
