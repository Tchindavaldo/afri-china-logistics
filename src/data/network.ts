export interface Gateway {
  code: string; // ISO-2
  port: string;
  /** Pour les pays enclavés : corridor emprunté après le port. */
  corridor?: string;
}

export interface NetworkRegion {
  name: string;
  gateways: Gateway[];
}

export const CHINA_ORIGINS = {
  ports: ['Shanghai', 'Ningbo', 'Shenzhen (Yantian / Shekou)', 'Guangzhou (Nansha)', 'Xiamen', 'Qingdao'],
  airports: ['Guangzhou Baiyun (CAN)', 'Shenzhen Bao’an (SZX)', 'Shanghai Pudong (PVG)', 'Hong Kong (HKG)'],
  hubs: ['Yiwu', 'Foshan', 'Dongguan', 'Guangzhou'],
};

export const AFRICA_NETWORK: NetworkRegion[] = [
  {
    name: 'Afrique centrale',
    gateways: [
      { code: 'CM', port: 'Douala · Kribi' },
      { code: 'GA', port: 'Libreville (Owendo)' },
      { code: 'GQ', port: 'Bata · Malabo' },
      { code: 'CG', port: 'Pointe-Noire' },
      { code: 'CD', port: 'Matadi · Boma' },
      { code: 'AO', port: 'Luanda' },
      { code: 'TD', port: 'Douala', corridor: "Douala → N'Djaména" },
      { code: 'CF', port: 'Douala', corridor: 'Douala → Bangui' },
    ],
  },
  {
    name: "Afrique de l'Ouest",
    gateways: [
      { code: 'NG', port: 'Lagos (Apapa / Tin Can)' },
      { code: 'CI', port: 'Abidjan · San-Pédro' },
      { code: 'SN', port: 'Dakar' },
      { code: 'GH', port: 'Tema' },
      { code: 'BJ', port: 'Cotonou' },
      { code: 'TG', port: 'Lomé' },
      { code: 'GN', port: 'Conakry' },
      { code: 'SL', port: 'Freetown' },
      { code: 'LR', port: 'Monrovia' },
      { code: 'MR', port: 'Nouakchott' },
      { code: 'ML', port: 'Dakar', corridor: 'Dakar → Bamako' },
      { code: 'BF', port: 'Tema', corridor: 'Tema → Ouagadougou' },
      { code: 'NE', port: 'Cotonou', corridor: 'Cotonou → Niamey' },
    ],
  },
  {
    name: "Afrique de l'Est",
    gateways: [
      { code: 'KE', port: 'Mombasa' },
      { code: 'TZ', port: 'Dar es Salaam' },
      { code: 'DJ', port: 'Djibouti' },
      { code: 'MG', port: 'Toamasina' },
      { code: 'MZ', port: 'Maputo' },
      { code: 'UG', port: 'Mombasa', corridor: 'Mombasa → Kampala' },
      { code: 'RW', port: 'Dar es Salaam', corridor: 'Dar es Salaam → Kigali' },
      { code: 'ET', port: 'Djibouti', corridor: 'Djibouti → Addis-Abeba' },
    ],
  },
  {
    name: 'Afrique du Nord & australe',
    gateways: [
      { code: 'MA', port: 'Casablanca · Tanger Med' },
      { code: 'DZ', port: 'Alger' },
      { code: 'TN', port: 'Radès (Tunis)' },
      { code: 'EG', port: 'Alexandrie' },
      { code: 'ZA', port: 'Durban · Le Cap' },
    ],
  },
];
