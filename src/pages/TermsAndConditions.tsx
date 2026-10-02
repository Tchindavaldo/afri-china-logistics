import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import { useSiteSettings } from '../context/settings-context';

export default function TermsAndConditions() {
  const { settings } = useSiteSettings();
  const name = settings.company_name;

  const sections: { title: string; body: string[] }[] = [
    {
      title: 'Objet',
      body: [
        `Les présentes conditions régissent les prestations de transport et de logistique proposées par ${name} (fret maritime, fret aérien, groupage, réception de marchandises, dédouanement et livraison), ainsi que l'utilisation du site et de son service de suivi.`,
      ],
    },
    {
      title: 'Devis et commande',
      body: [
        "Chaque prestation fait l'objet d'un devis écrit précisant le mode de transport, l'itinéraire, les frais inclus et les délais indicatifs. La commande est réputée acceptée à la confirmation écrite du devis par le client.",
        'Les tarifs peuvent évoluer en fonction des surcharges des compagnies maritimes ou aériennes, des taux de change et des frais portuaires ; toute variation est communiquée avant le départ.',
      ],
    },
    {
      title: 'Obligations du client',
      body: [
        'Le client fournit une description exacte de la marchandise (nature, quantité, poids, valeur) et les documents nécessaires (facture commerciale, liste de colisage, certificats éventuels).',
        "Le client garantit que la marchandise n'est pas interdite à l'import ou à l'export et qu'elle est correctement emballée. Les marchandises dangereuses doivent être déclarées comme telles.",
      ],
    },
    {
      title: 'Délais',
      body: [
        "Les délais communiqués sont indicatifs. Ils peuvent être affectés par des facteurs extérieurs : conditions météorologiques, congestion portuaire, contrôles douaniers, changements d'horaires des transporteurs. Ces aléas ne sauraient engager la responsabilité de " +
          name +
          '.',
      ],
    },
    {
      title: 'Assurance et responsabilité',
      body: [
        "Une assurance marchandise peut être souscrite sur demande ; son montant et son statut de paiement apparaissent sur la page de suivi. À défaut d'assurance, la responsabilité du transporteur est limitée selon les conventions internationales applicables.",
        'Toute réserve sur l’état de la marchandise doit être formulée par écrit au moment de la livraison.',
      ],
    },
    {
      title: 'Droits, taxes et frais à destination',
      body: [
        "Sauf mention contraire au devis, les droits de douane, taxes d'importation et frais locaux à destination sont à la charge du destinataire. Leur montant et leur statut peuvent être consultés sur la page de suivi.",
      ],
    },
    {
      title: 'Suivi en ligne et données personnelles',
      body: [
        "Le numéro de suivi donne accès aux informations de l'expédition, y compris les coordonnées de l'expéditeur et du destinataire : il doit être communiqué uniquement aux personnes concernées.",
        "Les données collectées servent exclusivement à l'exécution des prestations et au suivi des envois. Vous pouvez demander leur consultation, rectification ou suppression en écrivant à " +
          (settings.site_email || 'notre adresse de contact') +
          '.',
      ],
    },
    {
      title: 'Litiges',
      body: ['En cas de différend, les parties recherchent d’abord une solution amiable. À défaut, le litige est porté devant les juridictions compétentes du siège de ' + name + '.'],
    },
  ];

  return (
    <>
      <SEO />
      <PageHero eyebrow="Légal" crumbs={['Conditions générales']} image="documents" imageAlt="Documents contractuels" imageCaption="Prestations &amp; site" title="Conditions générales" lead={`Conditions applicables aux prestations de ${name} et à l'utilisation du site.`} />
      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] xl:gap-20">
          <nav className="hidden lg:block">
            <ol className="sticky top-28 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#art-${i + 1}`} className="flex gap-3 text-muted hover:text-cobalt-500">
                    <span className="font-mono text-cobalt-500">{String(i + 1).padStart(2, '0')}</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-4xl space-y-10">
            {sections.map((s, i) => (
              <section key={s.title} id={`art-${i + 1}`} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 font-display text-xl font-bold text-ink">
                  <span className="font-mono text-sm text-cobalt-500">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                {s.body.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-ink/80">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
