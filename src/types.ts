export type TransportMode = 'sea' | 'air';

export type TrackingStage = 'picked_up' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered';

export type UserRole = 'admin' | 'client';

export interface Insurance {
  name: string;
  amount: string;
  paid: boolean;
}

/** Champs éditables d'une expédition (formulaire admin). */
export interface ShipmentInput {
  tracking_number: string;
  status: string;
  status_date: string;
  status_time: string;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  transport_mode: TransportMode;
  carrier: string;
  carrier_reference: string;
  product: string;
  package_description: string;
  type_of_shipment: string;
  quantity: number;
  weight: string;
  departure_date: string;
  departure_time: string;
  expected_delivery_date: string;
  delivery_time: string;
  total_duration_days: number;
  tracking_progress: number;
  tracking_stage: TrackingStage;
  payment_mode: string;
  total_freight: string;
  insurances: Insurance[];
  import_tax: string;
  import_tax_paid: boolean;
  shipper_name: string;
  shipper_phone: string;
  shipper_email: string;
  shipper_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_email: string;
  receiver_address: string;
  comment: string;
  image_url: string;
}

/** Ligne telle que renvoyée par Supabase (dates nulles possibles). */
export interface Shipment extends Omit<ShipmentInput, 'status_date' | 'departure_date' | 'expected_delivery_date'> {
  id: string;
  status_date: string | null;
  departure_date: string | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  company_name: string;
  company_description: string;
  site_email: string;
  support_email: string;
  site_phone: string;
  whatsapp_phone: string;
  site_address: string;
  opening_hours: string;
  whatsapp_country_code: string;
  whatsapp_template: string;
}

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}
