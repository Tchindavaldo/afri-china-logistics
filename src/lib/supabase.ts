import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants : copiez .env.example vers .env');
}

export const supabase = createClient(supabaseUrl ?? 'http://localhost', supabaseAnonKey ?? 'missing-key');

// Projet Supabase partagé avec les autres sites : tout est préfixé.
export const TABLES = {
  shipments: 'cyrille_africhina_shipments',
  settings: 'cyrille_africhina_site_settings',
  users: 'cyrille_africhina_users',
} as const;

export const RPC = {
  track: 'cyrille_africhina_track',
  myRole: 'cyrille_africhina_my_role',
} as const;

export const STORAGE_BUCKET = 'shipment-images';
export const STORAGE_FOLDER = 'africhina';
