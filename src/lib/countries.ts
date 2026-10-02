export type Region = 'Asie' | 'Afrique' | 'Europe' | 'Amériques';

export interface Country {
  code: string; // ISO-2
  name: string;
  region: Region;
  lat: number;
  lng: number;
  /** Noms possibles dans le fond de carte world-atlas (frontières du globe). */
  mapNames: string[];
}

export const COUNTRIES: Country[] = [
  // Asie
  { code: 'CN', name: 'Chine', region: 'Asie', lat: 35.8617, lng: 104.1954, mapNames: ['China'] },
  { code: 'HK', name: 'Hong Kong', region: 'Asie', lat: 22.3193, lng: 114.1694, mapNames: ['Hong Kong'] },
  { code: 'JP', name: 'Japon', region: 'Asie', lat: 36.2048, lng: 138.2529, mapNames: ['Japan'] },
  { code: 'KR', name: 'Corée du Sud', region: 'Asie', lat: 35.9078, lng: 127.7669, mapNames: ['South Korea'] },
  { code: 'VN', name: 'Vietnam', region: 'Asie', lat: 14.0583, lng: 108.2772, mapNames: ['Vietnam'] },
  { code: 'TH', name: 'Thaïlande', region: 'Asie', lat: 15.87, lng: 100.9925, mapNames: ['Thailand'] },
  { code: 'MY', name: 'Malaisie', region: 'Asie', lat: 4.2105, lng: 101.9758, mapNames: ['Malaysia'] },
  { code: 'IN', name: 'Inde', region: 'Asie', lat: 20.5937, lng: 78.9629, mapNames: ['India'] },
  { code: 'AE', name: 'Émirats Arabes Unis', region: 'Asie', lat: 23.4241, lng: 53.8478, mapNames: ['United Arab Emirates'] },
  { code: 'TR', name: 'Turquie', region: 'Asie', lat: 38.9637, lng: 35.2433, mapNames: ['Turkey'] },

  // Afrique
  { code: 'CM', name: 'Cameroun', region: 'Afrique', lat: 7.3697, lng: 12.3547, mapNames: ['Cameroon'] },
  { code: 'NG', name: 'Nigeria', region: 'Afrique', lat: 9.082, lng: 8.6753, mapNames: ['Nigeria'] },
  { code: 'CI', name: "Côte d'Ivoire", region: 'Afrique', lat: 7.54, lng: -5.5471, mapNames: ["Côte d'Ivoire", 'Ivory Coast'] },
  { code: 'SN', name: 'Sénégal', region: 'Afrique', lat: 14.4974, lng: -14.4524, mapNames: ['Senegal'] },
  { code: 'GA', name: 'Gabon', region: 'Afrique', lat: -0.8037, lng: 11.6094, mapNames: ['Gabon'] },
  { code: 'GQ', name: 'Guinée équatoriale', region: 'Afrique', lat: 1.6508, lng: 10.2679, mapNames: ['Eq. Guinea'] },
  { code: 'CG', name: 'Congo', region: 'Afrique', lat: -0.228, lng: 15.8277, mapNames: ['Congo', 'Republic of the Congo'] },
  { code: 'CD', name: 'RD Congo', region: 'Afrique', lat: -4.0383, lng: 21.7587, mapNames: ['Dem. Rep. Congo', 'Democratic Republic of the Congo'] },
  { code: 'AO', name: 'Angola', region: 'Afrique', lat: -11.2027, lng: 17.8739, mapNames: ['Angola'] },
  { code: 'BJ', name: 'Bénin', region: 'Afrique', lat: 9.3077, lng: 2.3158, mapNames: ['Benin'] },
  { code: 'TG', name: 'Togo', region: 'Afrique', lat: 8.6195, lng: 0.8248, mapNames: ['Togo'] },
  { code: 'GH', name: 'Ghana', region: 'Afrique', lat: 7.9465, lng: -1.0232, mapNames: ['Ghana'] },
  { code: 'GN', name: 'Guinée', region: 'Afrique', lat: 9.9456, lng: -9.6966, mapNames: ['Guinea'] },
  { code: 'SL', name: 'Sierra Leone', region: 'Afrique', lat: 8.4606, lng: -11.7799, mapNames: ['Sierra Leone'] },
  { code: 'LR', name: 'Liberia', region: 'Afrique', lat: 6.4281, lng: -9.4295, mapNames: ['Liberia'] },
  { code: 'MR', name: 'Mauritanie', region: 'Afrique', lat: 21.0079, lng: -10.9408, mapNames: ['Mauritania'] },
  { code: 'BF', name: 'Burkina Faso', region: 'Afrique', lat: 12.2383, lng: -1.5616, mapNames: ['Burkina Faso'] },
  { code: 'ML', name: 'Mali', region: 'Afrique', lat: 17.5707, lng: -3.9962, mapNames: ['Mali'] },
  { code: 'NE', name: 'Niger', region: 'Afrique', lat: 17.6078, lng: 8.0817, mapNames: ['Niger'] },
  { code: 'TD', name: 'Tchad', region: 'Afrique', lat: 15.4542, lng: 18.7322, mapNames: ['Chad'] },
  { code: 'CF', name: 'Centrafrique', region: 'Afrique', lat: 6.6111, lng: 20.9394, mapNames: ['Central African Rep.', 'Central African Republic'] },
  { code: 'MA', name: 'Maroc', region: 'Afrique', lat: 31.7917, lng: -7.0926, mapNames: ['Morocco'] },
  { code: 'DZ', name: 'Algérie', region: 'Afrique', lat: 28.0339, lng: 1.6596, mapNames: ['Algeria'] },
  { code: 'TN', name: 'Tunisie', region: 'Afrique', lat: 33.8869, lng: 9.5375, mapNames: ['Tunisia'] },
  { code: 'EG', name: 'Égypte', region: 'Afrique', lat: 26.8206, lng: 30.8025, mapNames: ['Egypt'] },
  { code: 'DJ', name: 'Djibouti', region: 'Afrique', lat: 11.8251, lng: 42.5903, mapNames: ['Djibouti'] },
  { code: 'ET', name: 'Éthiopie', region: 'Afrique', lat: 9.145, lng: 40.4897, mapNames: ['Ethiopia'] },
  { code: 'KE', name: 'Kenya', region: 'Afrique', lat: -0.0236, lng: 37.9062, mapNames: ['Kenya'] },
  { code: 'UG', name: 'Ouganda', region: 'Afrique', lat: 1.3733, lng: 32.2903, mapNames: ['Uganda'] },
  { code: 'RW', name: 'Rwanda', region: 'Afrique', lat: -1.9403, lng: 29.8739, mapNames: ['Rwanda'] },
  { code: 'TZ', name: 'Tanzanie', region: 'Afrique', lat: -6.369, lng: 34.8888, mapNames: ['Tanzania'] },
  { code: 'MZ', name: 'Mozambique', region: 'Afrique', lat: -18.6657, lng: 35.5296, mapNames: ['Mozambique'] },
  { code: 'MG', name: 'Madagascar', region: 'Afrique', lat: -18.7669, lng: 46.8691, mapNames: ['Madagascar'] },
  { code: 'ZA', name: 'Afrique du Sud', region: 'Afrique', lat: -30.5595, lng: 22.9375, mapNames: ['South Africa'] },

  // Europe
  { code: 'FR', name: 'France', region: 'Europe', lat: 46.2276, lng: 2.2137, mapNames: ['France'] },
  { code: 'BE', name: 'Belgique', region: 'Europe', lat: 50.5039, lng: 4.4699, mapNames: ['Belgium'] },
  { code: 'NL', name: 'Pays-Bas', region: 'Europe', lat: 52.1326, lng: 5.2913, mapNames: ['Netherlands'] },
  { code: 'DE', name: 'Allemagne', region: 'Europe', lat: 51.1657, lng: 10.4515, mapNames: ['Germany'] },
  { code: 'IT', name: 'Italie', region: 'Europe', lat: 41.8719, lng: 12.5674, mapNames: ['Italy'] },
  { code: 'ES', name: 'Espagne', region: 'Europe', lat: 40.4637, lng: -3.7492, mapNames: ['Spain'] },
  { code: 'GB', name: 'Royaume-Uni', region: 'Europe', lat: 55.3781, lng: -3.436, mapNames: ['United Kingdom'] },

  // Amériques
  { code: 'US', name: 'États-Unis', region: 'Amériques', lat: 37.0902, lng: -95.7129, mapNames: ['United States of America', 'United States'] },
  { code: 'CA', name: 'Canada', region: 'Amériques', lat: 56.1304, lng: -106.3468, mapNames: ['Canada'] },
  { code: 'BR', name: 'Brésil', region: 'Amériques', lat: -14.235, lng: -51.9253, mapNames: ['Brazil'] },
];

export const REGIONS: Region[] = ['Asie', 'Afrique', 'Europe', 'Amériques'];

export function getCountry(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code);
}

export function countryName(code: string | null | undefined): string {
  return getCountry(code)?.name ?? '';
}

/** Drapeau emoji à partir du code ISO-2 (🇨🇲, 🇨🇳…). */
export function flag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const AFRICAN_COUNTRY_COUNT = COUNTRIES.filter((c) => c.region === 'Afrique').length;
