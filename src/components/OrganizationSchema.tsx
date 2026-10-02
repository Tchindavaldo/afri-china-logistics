import { useEffect } from 'react';
import { useSiteSettings } from '../context/settings-context';
import { SITE_URL } from '../lib/site';
import { organizationJsonLd } from '../lib/seo';

/**
 * Données structurées de l'entreprise (logo et coordonnées dans Google), sur
 * toutes les pages publiques. Uniquement des informations réelles issues des
 * paramètres du site : pas de note ni d'avis inventés, que Google sanctionne.
 */
export default function OrganizationSchema() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const data = organizationJsonLd(
      { url: SITE_URL, name: settings.company_name },
      {
        ...(settings.company_description && { description: settings.company_description }),
        email: settings.site_email || undefined,
        telephone: settings.site_phone || undefined,
        address: settings.site_address || undefined,
      }
    );
    let script = document.getElementById('organization-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'organization-schema';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [settings]);

  return null;
}
