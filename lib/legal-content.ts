/**
 * Textes juridiques de référence et clauses par défaut
 * pour TIMES Café Bar & Grill
 * Phase 7 - Conformité & Juridique
 */

export const DEFAULT_CGU_CGV_CONTENT = {
  titre: "Conditions Générales d'Utilisation et de Vente (CGU / CGV)",
  sousTitre: "Régissant les commandes en ligne, livraisons, encaissements Mobile Money et dégustations chez TIMES Café Bar & Grill",
  derniereMiseAJour: "13 Septembre 2026",
  version: "7.0 - Édition Officielle",
  articles: [
    {
      id: "art-1",
      numero: "Article 1",
      titre: "Mentions Légales & Identification de l'Établissement",
      contenu: `L'application web et les services de commande en ligne sont édités et exploités par l'établissement :
• Dénomination commerciale : TIMES Café Bar & Grill
• Activités : Café de spécialité, Bar à cocktails d'auteur, Restaurant de viandes braisées au feu de bois & Desserts maison
• Adresse d'exploitation : Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad, Cotonou — Bénin
• Téléphone(s) officiel(s) : +229 01 69 69 86 86 / +229 01 91 49 33 33
• Ligne d'assistance WhatsApp officiel : +229 01 69 69 86 86 (Service Client & Commandes)
• E-mail officiel : timeslesmoments@gmail.com
• Responsable de la publication : Direction de l'Établissement TIMES Café Bar & Grill.`
    },
    {
      id: "art-2",
      numero: "Article 2",
      titre: "Champ d'Application & Acceptation des Conditions",
      contenu: `Les présentes Conditions Générales d'Utilisation et de Vente (ci-après les « CGU / CGV ») s'appliquent sans restriction ni réserve à l'ensemble des ventes, réservations et prestations conclues par TIMES Café Bar & Grill auprès des clients consommateurs via la plateforme numérique.

Ces conditions régissent les trois modes de consommation proposés :
1. Sur place : Consommation en salle, au comptoir du bar ou en terrasse avec attribution d'un numéro de table.
2. À emporter (Click & Collect) : Commande préparée et mise à disposition au comptoir à l'heure convenue.
3. Livraison à domicile ou au bureau : Expédition par notre service de coursiers partenaires à l'adresse indiquée par le client.

Toute passation de commande implique l'acceptation pleine, entière et sans réserve des présentes CGU / CGV par le biais d'une case à cocher obligatoire avant toute validation de paiement.`
    },
    {
      id: "art-3",
      numero: "Article 3",
      titre: "Produits, Carte & Disponibilité des Denrées",
      contenu: `Les produits proposés sont ceux qui figurent sur la carte en ligne de TIMES Café Bar & Grill au moment de la consultation, dans la limite des stocks disponibles et de la fraîcheur des arrivages du jour (viandes Angus sélectionnées, cafés de terroir, fruits frais pour cocktails).

Des ruptures temporaires peuvent survenir en cours de service. En cas d'indisponibilité d'un ingrédient ou produit après validation de la commande, le restaurant contacte immédiatement le client par téléphone ou WhatsApp pour lui proposer une alternative équivalente ou un remboursement partiel immédiat.`
    },
    {
      id: "art-4",
      numero: "Article 4",
      titre: "Tarifs & Devise Officielle (FCFA)",
      contenu: `Les prix de nos plats, boissons et menus sont exclusivement indiqués et facturés en Francs CFA (FCFA / XOF), monnaie officielle en vigueur en République du Bénin.

Tous les prix affichés sont exprimés toutes taxes comprises (TTC), service inclus. Les frais de livraison éventuels sont clairement détaillés avant la validation finale du panier (forfait standard de 1 500 FCFA pour les livraisons de proximité à Cotonou).`
    },
    {
      id: "art-5",
      numero: "Article 5",
      titre: "Paiement Sécurisé & Intégration Mobile Money (FedaPay & KKiaPay)",
      contenu: `Le règlement des commandes s'effectue en ligne au moment de la validation, ou exceptionnellement sur place selon les options activées :
1. Mobile Money UEMOA / Bénin : Paiements instantanés et sécurisés via les agrégateurs certifiés FedaPay et KKiaPay, prenant en charge MTN Mobile Money, Moov Money, et Celtiis Cash.
2. Cartes Bancaires : Cartes bancaires internationales (Visa, Mastercard) via protocoles de sécurisation 3D-Secure.
3. Espèces / Monnaie locale : Uniquement pour les règlements autorisés au comptoir ou auprès du livreur sous réserve d'appoint.

TIMES Café Bar & Grill ne stocke aucune coordonnée bancaire, code secret ou code PIN confidentiel. L'authentification par mot de passe à usage unique (OTP) est opérée directement par les serveurs certifiés des opérateurs télécoms et bancaires.`
    },
    {
      id: "art-6",
      numero: "Article 6",
      titre: "Reçus Numériques & Facturation Électronique Immédiate",
      contenu: `Dès la confirmation d'un paiement réussi, un reçu numérique officiel et infalsifiable est généré en temps réel par notre système. Ce reçu comprend :
• Le numéro de reçu officiel unique (ex: REC-TIMES-XXXXXX)
• La date et l'heure certifiées de la transaction
• L'identifiant de transaction passerelle (FedaPay / KKiaPay)
• Le détail des articles commandés, quantités et montants
• Le mode de consommation et les coordonnées de délivrance
• Le QR Code officiel d'authenticité permettant le contrôle en caisse et par la brigade de cuisine.

Le client peut télécharger, imprimer ou présenter son reçu numérique sur son smartphone à tout moment.`
    },
    {
      id: "art-7",
      numero: "Article 7",
      titre: "RÈGLE STRICTE D'ANNULATION & DE MODIFICATION (Clause Essentielle)",
      contenu: `⚠️ DISPOSITION SPÉCIALE RESTAURATION & DENRÉES PÉRISSABLES :

Conformément aux règles applicables aux prestations de restauration et de denrées alimentaires préparées à la commande pour consommation immédiate :

1. COMMANDE AU STATUT « EN PRÉPARATION » :
Dès lors que la commande a été prise en compte par la brigade de cuisine ou le chef barman et que son statut est passé à « En préparation » sur le terminal KDS, AUCUNE ANNULATION, NI AUCUN REMBOURSEMENT NE PEUT ÊTRE ACCORDÉ.
Cette règle impérative est motivée par le fait que les viandes maturées sont immédiatement saisies au feu de bois, les cocktails assemblés minute et les ingrédients nobles découpés spécifiquement pour la commande du client.

2. ANNULATION AVANT PRÉPARATION :
L'annulation sans frais d'une commande n'est recevable que si elle intervient pendant la phase initiale où la commande est au statut « Commande en cours / En attente » (généralement dans les 2 à 3 minutes suivant le paiement) en contactant en extrême urgence le standard téléphonique ou WhatsApp de l'établissement (+229 01 69 69 86 86).

3. NON-RÉCEPTION OU DÉFAUT DU CLIENT :
Si le client est injoignable par le livreur à l'adresse indiquée après 10 minutes d'attente, ou s'il ne se présente pas pour retirer sa commande Click & Collect, la commande sera conservée 30 minutes puis détruite pour des raisons sanitaires impératives. Aucun remboursement ne sera alors exigible.`
    },
    {
      id: "art-8",
      numero: "Article 8",
      titre: "Livraison, Retrait & Délais Indicatifs",
      contenu: `Les délais de préparation et de livraison sont communiqués à titre indicatif :
• Préparation moyenne en cuisine / bar : 15 à 25 minutes selon l'affluence du service.
• Délai de livraison : 20 à 35 minutes selon la circulation urbaine et les conditions météorologiques.

TIMES Café Bar & Grill met en œuvre toutes les diligences nécessaires pour maintenir la chaîne du chaud et du froid grâce à des emballages isothermes et étanches de qualité supérieure.`
    },
    {
      id: "art-9",
      numero: "Article 9",
      titre: "Allergènes, Régimes Particuliers & Hygiène Alimentaire",
      contenu: `Les informations relatives aux 14 allergènes à déclaration obligatoire sont disponibles sur simple demande auprès de notre personnel de salle ou via le champ « Instructions spéciales » lors de la commande.

Nos équipes respectent rigoureusement les normes sanitaires HACCP les plus exigeantes pour garantir une sécurité alimentaire irréprochable.`
    },
    {
      id: "art-10",
      numero: "Article 10",
      titre: "Réclamations, Service Client & Règlement des Litiges",
      contenu: `Pour toute réclamation, incident de livraison ou question relative à une commande, notre service client est joignable :
• Par WhatsApp officiel : +229 01 69 69 86 86
• Par téléphone : +229 01 69 69 86 86 / +229 01 91 49 33 33
• Par e-mail : timeslesmoments@gmail.com

Nous nous engageons à traiter toute demande dans un délai maximal de 24 heures ouvrées. En cas de différend non résolu à l'amiable, les tribunaux compétents du siège de l'établissement seront seuls compétents.`
    }
  ]
};

export const DEFAULT_PRIVACY_POLICY_CONTENT = {
  titre: "Politique de Confidentialité & Protection des Données Personnelles",
  sousTitre: "Engagement de transparence, respect de la vie privée et conformité numérique chez TIMES Café Bar & Grill",
  derniereMiseAJour: "13 Septembre 2026",
  version: "7.0 - Édition Officielle",
  articles: [
    {
      id: "priv-1",
      numero: "Section 1",
      titre: "Identité du Responsable du Traitement",
      contenu: `Le responsable du traitement des données personnelles collectées via l'application web de TIMES Café Bar & Grill est :
• TIMES Café Bar & Grill
• Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad, Cotonou — Bénin
• E-mail du Délégué à la Protection des Données (DPO) : timeslesmoments@gmail.com
• Ligne d'assistance WhatsApp : +229 01 69 69 86 86.`
    },
    {
      id: "priv-2",
      numero: "Section 2",
      titre: "Données Personnelles Collectées (Minimisation Stricte)",
      contenu: `Conformément au principe fondamental de minimisation des données, TIMES Café Bar & Grill ne collecte que les informations strictement indispensables à la bonne exécution des prestations culinaires et logistiques :
1. Données d'identité du client :
   • Nom et prénom (pour la facturation, l'accueil en salle et l'identification de la commande).
2. Données de contact et de notification :
   • Numéro de téléphone portable (indispensable pour l'initiation des paiements Mobile Money MTN/Moov/Celtiis, l'envoi de SMS de confirmation et le contact avec le coursier).
   • Adresse e-mail (facultative, utilisée pour la transmission du reçu numérique et les communications relatives au compte).
3. Données de localisation et de livraison :
   • Adresse physique de livraison, ville, code postal et instructions complémentaires (étage, digicode, interphone) uniquement en cas de commande en mode « Livraison ».
4. Données de service :
   • Numéro de table (en mode « Sur place »), créneau horaire souhaité (en mode « À emporter »), historique des commandes et reçus numériques émis.`
    },
    {
      id: "priv-3",
      numero: "Section 3",
      titre: "ABSENCE ABSOLUE DE STOCKAGE DES DONNÉES FINANCIÈRES CONFIDENTIELLES",
      contenu: `🔒 ENGAGEMENT DE SÉCURITÉ BANCAIRE & MOBILE MONEY :

TIMES Café Bar & Grill applique la règle de sécurité la plus stricte concernant les paiements :

• ZÉRO STOCKAGE DE DONNÉES BANCAIRES : Notre plateforme ne stocke, ne conserve, n'enregistre et n'a jamais accès à vos numéros de carte bancaire, cryptogrammes visuels (CVV/CVC), mots de passe bancaires ou codes secrets.
• ZÉRO STOCKAGE DE CODES PIN MOBILE MONEY : Les codes PIN et autorisations de prélèvement Mobile Money (MTN MoMo, Moov Money, Celtiis Cash) sont saisis exclusivement sur les interfaces hautement sécurisées des opérateurs télécoms et des passerelles agréées FedaPay et KKiaPay.
• Les transactions sont chiffrées selon les normes de sécurité PCI-DSS de niveau 1 et les protocoles SSL / TLS 256 bits.`
    },
    {
      id: "priv-4",
      numero: "Section 4",
      titre: "Finalités et Bases Légales du Traitement",
      contenu: `Vos données personnelles sont traitées pour les finalités suivantes :
1. Exécution du contrat de vente : Préparation de votre commande en cuisine et au bar, assignation des plats, gestion de la caisse et livraison.
2. Gestion de la facturation et conformité fiscale : Émission des reçus numériques obligatoires et tenue du registre des ventes.
3. Communication de service : Suivi en direct du statut de préparation (« Commande en cours », « En préparation », « Prête », « Livrée ») et alertes en cas d'imprévu.
4. Amélioration du service : Analyse statistique anonymisée de la fréquentation pour optimiser les approvisionnements de la brigade de cuisine.`
    },
    {
      id: "priv-5",
      numero: "Section 5",
      titre: "Destinataires des Données & Absence de Revente",
      contenu: `TIMES Café Bar & Grill ne revend, ne loue, n'échange et ne cède aucune de vos données personnelles à des fins de prospection commerciale tierce.

Les seuls destinataires autorisés de vos données sont :
• Le personnel habilité de TIMES Café Bar & Grill (chefs de cuisine, barmans, maîtres d'hôtel, administrateurs caisse).
• Les prestataires de paiement certifiés (FedaPay, KKiaPay) pour le traitement technique exclusif du règlement.
• Les coursiers et livreurs partenaires, pour les seules données nécessaires à la remise physique de la commande (adresse, nom, téléphone).`
    },
    {
      id: "priv-6",
      numero: "Section 6",
      titre: "Durée de Conservation des Données",
      contenu: `Vos données sont conservées pour une durée strictement proportionnée aux finalités poursuivies :
• Données de commande et reçus numériques : Conservées pour la durée légale requise par les obligations comptables et fiscales (jusqu'à 10 ans pour les justificatifs de caisse).
• Données de contact client : Conservées pendant une durée de 3 ans à compter du dernier contact ou de la dernière commande active, sauf demande expresse de suppression anticipée.
• Cookies techniques de session : Supprimés automatiquement dès la clôture de la session du navigateur ou après 30 jours maximum.`
    },
    {
      id: "priv-7",
      numero: "Section 7",
      titre: "Vos Droits & Procédure de Suppression des Données (« Droit à l'Oubli »)",
      contenu: `Conformément aux réglementations sur la protection des données personnelles (notamment le RGPD et les dispositions nationales en matière de protection des données) :

Vous bénéficiez à tout moment des droits suivants :
1. Droit d'accès : Obtenir la confirmation que des données vous concernant sont traitées et en recevoir une copie complète.
2. Droit de rectification : Demander la correction immédiate de données inexactes ou obsolètes.
3. Droit à l'effacement (« Droit à l'oubli ») : Demander la suppression intégrale et irréversible de vos informations personnelles de nos bases de données clients.
4. Droit d'opposition et de limitation : Vous opposer à certains traitements ou en demander la limitation temporaire.
5. Droit à la portabilité : Recevoir vos données dans un format structuré et couramment utilisé.

COMMENT EXERCER VOS DROITS ?
Pour exercer l'un de ces droits ou demander la suppression de vos données, il vous suffit de nous adresser une demande simple sans frais :
• Par e-mail à : timeslesmoments@gmail.com
• Par message WhatsApp au Service Client : +229 01 69 69 86 86
• Par courrier postal ou sur place : Times Café Bar & Grill - PK6 Akpakpa Le Belier, voie pavée venant vers la plage, à droite face CenSad, Cotonou — Bénin.

Votre demande sera traitée dans un délai maximal de 30 jours calendaires.`
    },
    {
      id: "priv-8",
      numero: "Section 8",
      titre: "Cookies, Stockage Local & Sécurité Technique",
      contenu: `Notre site utilise le stockage local (LocalStorage / cookies techniques) exclusivement pour :
• Mémoriser le contenu de votre panier en cours pendant votre navigation.
• Conserver vos préférences d'affichage (thème sombre) et la devise sélectionnée.
• Vous permettre de consulter l'historique récent de vos reçus numériques.

Nous n'utilisons aucun cookie tiers intrusif à visée de traçage publicitaire ou de profilage comportemental sans votre accord.`
    }
  ]
};

export const DEFAULT_CANCELLATION_RULE_SUMMARY = 
  "Conformément aux Conditions Générales de Vente, toute commande est définitive et non annulable dès lors que le statut « En préparation » est activé par la cuisine ou le bar (engagements immédiats des viandes d'exception, découpe et cuisson minute).";
