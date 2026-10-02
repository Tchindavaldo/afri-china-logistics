import type { SiteSettings } from '../types';

export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'AFRICHINA LOGISTICS';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.africhinalogistics.com').replace(/\/$/, '');

// Valeurs affichées tant que les paramètres Supabase ne sont pas chargés
// (ou si la table est vide).
export const DEFAULT_SETTINGS: SiteSettings = {
  company_name: SITE_NAME,
  company_description: '',
  site_email: 'contact@africhinalogistics.com',
  support_email: 'support@africhinalogistics.com',
  site_phone: '',
  whatsapp_phone: '',
  site_address: '',
  opening_hours: 'Lun – Sam · 8h – 18h',
  whatsapp_country_code: '237',
  whatsapp_template:
    'Bonjour {nom}, votre expédition {numero} ({origine} → {destination}) est enregistrée chez {societe}. Suivez-la en temps réel ici : {lien}',
};

/** Numéro au format international sans « + » ni espaces (pour wa.me / tel:). */
export function phoneDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function whatsappLink(phone: string, text?: string): string {
  const digits = phoneDigits(phone);
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function trackingUrl(trackingNumber: string): string {
  return `${window.location.origin}/track?tracking=${encodeURIComponent(trackingNumber)}`;
}
