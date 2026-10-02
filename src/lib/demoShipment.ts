import type { Shipment } from '../types';

/**
 * Colis fictif pour prévisualiser la page de suivi en développement
 * (/track?tracking=DEMO ou DEMO-AIR). Jamais inclus dans le build de prod.
 */
export function demoShipment(kind: 'sea' | 'air'): Shipment {
  const d = new Date();
  const iso = (offset: number) => new Date(d.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
  const sea = kind === 'sea';
  return {
    id: 'demo',
    tracking_number: sea ? 'DEMO' : 'DEMO-AIR',
    status: sea ? 'Embarqué — en mer' : 'Embarqué — vol en cours',
    status_date: iso(0),
    status_time: '09:30',
    origin: sea ? 'Shenzhen' : 'Guangzhou',
    origin_country: 'CN',
    destination: sea ? "N'Djaména" : 'Douala',
    destination_country: sea ? 'TD' : 'CM',
    transport_mode: kind,
    carrier: sea ? 'CMA CGM' : 'Ethiopian Cargo',
    carrier_reference: sea ? 'CMA-SZX-0042' : 'ET-AWB-0071',
    product: 'Pièces détachées',
    package_description: '12 cartons sur palette',
    type_of_shipment: sea ? 'Groupage (LCL)' : 'Colis express',
    quantity: 12,
    weight: '340 kg',
    departure_date: iso(sea ? -27 : -2),
    departure_time: '13:30',
    expected_delivery_date: iso(sea ? 18 : 3),
    delivery_time: '15:00',
    total_duration_days: sea ? 45 : 5,
    tracking_progress: 0,
    tracking_stage: 'picked_up',
    payment_mode: 'Virement bancaire',
    total_freight: '450 000 FCFA',
    insurances: [{ name: 'Assurance ad valorem', amount: '35 000 FCFA', paid: true }],
    import_tax: '120 000 FCFA',
    import_tax_paid: false,
    shipper_name: 'Fournisseur exemple',
    shipper_phone: '+86 000 0000 0000',
    shipper_email: 'expediteur@example.com',
    shipper_address: 'Shenzhen, Guangdong',
    receiver_name: 'Client exemple',
    receiver_phone: '+237 600 00 00 00',
    receiver_email: 'destinataire@example.com',
    receiver_address: sea ? "N'Djaména, Tchad" : 'Douala, Cameroun',
    comment: 'Données de démonstration (développement uniquement).',
    image_url: '',
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
  };
}
