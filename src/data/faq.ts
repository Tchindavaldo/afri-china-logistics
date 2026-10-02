export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: 'Comment suivre mon colis ?',
    a: "Un numéro de suivi (format AFC-XXXX-XXXX) vous est communiqué à l'enregistrement de votre expédition. Saisissez-le sur la page « Suivi » : vous verrez l'étape en cours, la progression jour par jour et le trajet sur le globe. Vous pouvez aussi scanner le QR code du bordereau.",
  },
  {
    q: 'Quels sont les délais entre la Chine et l’Afrique ?',
    a: "À titre indicatif : 3 à 7 jours en fret aérien, 35 à 60 jours en fret maritime selon le port de destination et le passage en douane. Pour les pays enclavés, comptez quelques jours de route supplémentaires après le port.",
  },
  {
    q: 'Quels documents faut-il pour importer ?',
    a: "En général : facture commerciale, liste de colisage et connaissement maritime (ou lettre de transport aérien). Certains produits demandent des certificats supplémentaires. Nous vérifions votre dossier avant le départ.",
  },
  {
    q: 'Puis-je regrouper des achats de plusieurs fournisseurs ?',
    a: "Oui. Vos fournisseurs livrent à notre point de réception en Chine ; nous pointons chaque colis puis expédions le tout en un seul envoi, ce qui réduit fortement le coût par article.",
  },
  {
    q: 'Ma marchandise est-elle assurée ?',
    a: "Une assurance marchandise peut être souscrite pour chaque expédition. Son statut (payée ou non) apparaît directement sur la page de suivi, tout comme les éventuelles taxes d’importation.",
  },
  {
    q: 'Comment obtenir un devis ?',
    a: "Remplissez le formulaire de devis sur la page Contact (origine, destination, mode, poids ou volume) : il nous parvient directement par WhatsApp ou par e-mail et nous vous répondons avec un tarif adapté.",
  },
];
