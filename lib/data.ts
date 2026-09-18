export interface MenuItem {
  id: string;
  name: string;
  category: 'cafe' | 'bar' | 'grill' | 'dessert';
  price: string;
  description: string;
  tag?: string;
  isSpecialty?: boolean;
}

export interface ReservationData {
  service: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // Côté Café
  {
    id: 'c1',
    name: 'Espresso Single Origin Éthiopie Yirgacheffe',
    category: 'cafe',
    price: '2 500 FCFA',
    description: 'Extraction précise, notes florales de jasmin et bergamote, torréfaction artisanale maison.',
    tag: 'Signature Barista',
    isSpecialty: true,
  },
  {
    id: 'c2',
    name: 'Flat White Velours & Lait d\'Avoine Artisanal',
    category: 'cafe',
    price: '3 500 FCFA',
    description: 'Double ristretto dense, micro-mousse onctueuse et latte art soigné.',
    tag: 'Coup de cœur',
  },
  {
    id: 'c3',
    name: 'Cold Brew TIMES Infusion 18h',
    category: 'cafe',
    price: '4 000 FCFA',
    description: 'Café glacé infusé à froid goutte à goutte, servi avec zeste d\'orange flambé et baie de genièvre.',
    tag: 'Fait Maison',
  },
  {
    id: 'c4',
    name: 'Chai Latte Épices Torréfiées & Miel Sauvage',
    category: 'cafe',
    price: '3 800 FCFA',
    description: 'Cannelle de Ceylan, cardamome verte, poivre noir de Kampot et lait émulsionné.',
  },

  // Côté Bar & Cocktails
  {
    id: 'b1',
    name: 'Old Fashioned Fumé au Bois de Barrique',
    category: 'bar',
    price: '9 500 FCFA',
    description: 'Bourbon vieilli en fût de chêne, bitter maison aux écorces d\'orange, sirop de sucre muscovado et fumage minute au bois de pommier.',
    tag: 'Cocktail Signature',
    isSpecialty: true,
  },
  {
    id: 'b2',
    name: 'TIMES Ruby Sour & Vin de Bordeaux',
    category: 'bar',
    price: '9 000 FCFA',
    description: 'Rye whiskey, citron pressé, sirop de canne, blanc d\'œuf soyeux et réduction de vin rouge Merlot.',
    tag: 'Création Maison',
  },
  {
    id: 'b3',
    name: 'Smoked Negroni aux Braises',
    category: 'bar',
    price: '8 500 FCFA',
    description: 'Gin artisanal infusé aux baies de genièvre grillées, vermouth rouge Carpano et Campari vieilli.',
  },
  {
    id: 'b4',
    name: 'Verre de Saint-Émilion Grand Cru 2019',
    category: 'bar',
    price: '8 000 FCFA',
    description: 'Notes de cerise noire mûre, tanins soyeux, élevage soigné. Idéal avec nos viandes au grill.',
    tag: 'Sélection Sommelier',
  },

  // Côté Grill & Plats
  {
    id: 'g1',
    name: 'Côte de Bœuf Maturée 45 Jours (Pour 2)',
    category: 'grill',
    price: '55 000 FCFA',
    description: 'Race Angus sélectionnée, saisie à la flamme vive puis cuite à cœur sur braises de hêtre. Servie avec os à moelle rôti et jus corsé au vin rouge.',
    tag: 'Chef Signature',
    isSpecialty: true,
  },
  {
    id: 'g2',
    name: 'Picanha Braisée au Sel de Guérande & Chimichurri Fumé',
    category: 'grill',
    price: '18 500 FCFA',
    description: 'Tranchée minute, fondante et croustillante, accompagnée de légumes racines rôtis au romarin.',
    tag: 'Spécialité Braise',
  },
  {
    id: 'g3',
    name: 'Burger TIMES Black Angus & Cheddar Affiné',
    category: 'grill',
    price: '14 500 FCFA',
    description: 'Steak 180g haché gros grain grillé minute, bacon croustillant fumé au foin, confit d\'oignons au vin rouge, pain brioché toasté.',
    tag: 'Best-Seller',
  },
  {
    id: 'g4',
    name: 'Travers de Porc Ibérique Caramélisés au Bourbon',
    category: 'grill',
    price: '16 500 FCFA',
    description: 'Cuisson lente basse température 7 heures puis laqué sur le grill au miel et épices douces.',
  },

  // Desserts
  {
    id: 'd1',
    name: 'Fondant Cœur Coulant Chocolat Noir & Piment d\'Espelette',
    category: 'dessert',
    price: '6 000 FCFA',
    description: 'Chocolat 72% Guanaja, glace artisanale à la vanille Bourbon de Madagascar et coulis de fruits rouges.',
    tag: 'Gourmandise',
    isSpecialty: true,
  },
  {
    id: 'd2',
    name: 'Tiramisu Barista au Café TIMES & Liqueur Amaretto',
    category: 'dessert',
    price: '5 500 FCFA',
    description: 'Biscuits cuillère imbibés de notre espresso Yirgacheffe, crème mascarpone aérée, cacao brut hollandais.',
    tag: 'Recette Maison',
  },
];
