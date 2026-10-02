import type { Shipment, ShipmentInput } from '../../types';
import { computeProgress, daysBetweenISO, DURATION_RULES, generateTrackingNumber, isValidISODate, normalizeTrackingNumber } from '../../lib/tracking';

export type FormErrors = Partial<Record<keyof ShipmentInput, string>>;

export function emptyForm(): ShipmentInput {
  return {
    tracking_number: generateTrackingNumber(),
    status: '',
    status_date: '',
    status_time: '',
    origin: '',
    origin_country: 'CN',
    destination: '',
    destination_country: '',
    transport_mode: 'sea',
    carrier: '',
    carrier_reference: '',
    product: '',
    package_description: '',
    type_of_shipment: '',
    quantity: 1,
    weight: '',
    departure_date: '',
    departure_time: '',
    expected_delivery_date: '',
    delivery_time: '',
    total_duration_days: 0,
    tracking_progress: 0,
    tracking_stage: 'picked_up',
    payment_mode: '',
    total_freight: '',
    insurances: [],
    import_tax: '',
    import_tax_paid: false,
    shipper_name: '',
    shipper_phone: '',
    shipper_email: '',
    shipper_address: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    receiver_address: '',
    comment: '',
    image_url: '',
  };
}

/** Ligne Supabase -> formulaire (dates nulles -> chaînes vides). */
export function toForm(row: Shipment): ShipmentInput {
  const base = emptyForm();
  const out = { ...base } as ShipmentInput;
  for (const key of Object.keys(base) as (keyof ShipmentInput)[]) {
    const v = row[key as keyof Shipment];
    if (v !== null && v !== undefined) (out as unknown as Record<string, unknown>)[key] = v;
  }
  out.insurances = Array.isArray(row.insurances) ? row.insurances.map((i) => ({ ...i })) : [];
  return out;
}

/**
 * Valeurs calculées à partir des dates de départ et d'arrivée prévue :
 * durée du trajet, puis progression et étape du jour (jamais saisies à la main).
 */
export function autoValues(form: ShipmentInput) {
  const days = daysBetweenISO(form.departure_date, form.expected_delivery_date);
  const automatic = days > 0;
  const info = computeProgress({ ...form, total_duration_days: days });
  return {
    automatic,
    total_duration_days: days,
    tracking_progress: automatic ? info.progress : 0,
    tracking_stage: automatic ? info.stage : form.tracking_stage,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-().]{6,}$/;

export function validate(form: ShipmentInput): FormErrors {
  const e: FormErrors = {};
  const req = (key: keyof ShipmentInput, msg: string) => {
    if (!String(form[key] ?? '').trim()) e[key] = msg;
  };

  const tn = normalizeTrackingNumber(form.tracking_number);
  if (!tn) e.tracking_number = 'Numéro de suivi requis (bouton « Générer »).';
  else if (!/^[A-Z0-9-]{4,32}$/.test(tn)) e.tracking_number = 'Lettres, chiffres et tirets uniquement.';

  req('origin', "Ville d'origine requise.");
  req('destination', 'Ville de destination requise.');
  req('origin_country', "Pays d'origine requis.");
  req('destination_country', 'Pays de destination requis.');
  req('carrier', 'Transporteur requis.');

  if (form.shipper_name.trim().length < 2) e.shipper_name = "Nom de l'expéditeur requis.";
  if (form.receiver_name.trim().length < 2) e.receiver_name = 'Nom du destinataire requis.';

  for (const [key, label] of [['shipper_email', "de l'expéditeur"], ['receiver_email', 'du destinataire']] as const) {
    if (!form[key].trim()) e[key] = `E-mail ${label} requis.`;
    else if (!EMAIL_RE.test(form[key].trim())) e[key] = 'Format d’e-mail invalide.';
  }
  for (const [key, label] of [['shipper_phone', "de l'expéditeur"], ['receiver_phone', 'du destinataire']] as const) {
    if (!form[key].trim()) e[key] = `Téléphone ${label} requis.`;
    else if (!PHONE_RE.test(form[key].trim())) e[key] = 'Chiffres, espaces et « + » uniquement.';
  }

  if (form.quantity < 0) e.quantity = 'La quantité doit être positive.';

  if (!form.departure_date) e.departure_date = 'Date de départ requise.';
  else if (!isValidISODate(form.departure_date)) e.departure_date = 'Date invalide.';

  if (!form.expected_delivery_date) e.expected_delivery_date = "Date d'arrivée prévue requise.";
  else if (!isValidISODate(form.expected_delivery_date)) e.expected_delivery_date = 'Date invalide.';
  if (!form.status_date) e.status_date = 'Date du statut requise.';
  if (!form.status_time) e.status_time = 'Heure du statut requise.';

  if (isValidISODate(form.departure_date) && isValidISODate(form.expected_delivery_date)) {
    const days = daysBetweenISO(form.departure_date, form.expected_delivery_date);
    if (days <= 0) e.expected_delivery_date = "L'arrivée doit être après le départ.";
    else if (form.transport_mode === 'air' && days > DURATION_RULES.airMaxDays) {
      e.expected_delivery_date = `✈️ Aérien : ${DURATION_RULES.airMaxDays} jours maximum entre départ et arrivée (actuellement ${days}).`;
    } else if (form.transport_mode === 'sea' && days < DURATION_RULES.seaMinDays) {
      e.expected_delivery_date = `🚢 Maritime : ${DURATION_RULES.seaMinDays} jours minimum entre départ et arrivée (actuellement ${days}).`;
    }
  }

  form.insurances.forEach((ins) => {
    if (!ins.name.trim() || !ins.amount.trim()) e.insurances = 'Chaque assurance doit avoir un nom et un montant.';
  });

  return e;
}

/** Formulaire -> ligne Supabase (Postgres refuse "" pour une date). */
export function toPayload(form: ShipmentInput) {
  const auto = autoValues(form);
  const trim = (s: string) => s.trim();
  return {
    ...form,
    tracking_number: normalizeTrackingNumber(form.tracking_number),
    status: trim(form.status),
    origin: trim(form.origin),
    destination: trim(form.destination),
    carrier: trim(form.carrier),
    shipper_name: trim(form.shipper_name),
    receiver_name: trim(form.receiver_name),
    shipper_email: trim(form.shipper_email).toLowerCase(),
    receiver_email: trim(form.receiver_email).toLowerCase(),
    shipper_phone: trim(form.shipper_phone),
    receiver_phone: trim(form.receiver_phone),
    insurances: form.insurances.map((i) => ({ name: i.name.trim(), amount: i.amount.trim(), paid: i.paid })),
    status_date: form.status_date || null,
    departure_date: form.departure_date || null,
    expected_delivery_date: form.expected_delivery_date || null,
    total_duration_days: auto.total_duration_days,
    tracking_progress: auto.tracking_progress,
    tracking_stage: auto.tracking_stage,
  };
}

export const STATUS_SUGGESTIONS = [
  'Colis réceptionné à notre entrepôt en Chine',
  "En attente d'embarquement",
  'Embarqué — en mer',
  'Embarqué — vol en cours',
  'Arrivé au port de destination',
  "Arrivé à l'aéroport de destination",
  'En cours de dédouanement',
  'En attente du paiement des frais',
  'En cours de livraison',
  'Livré au destinataire',
];

export const SHIPMENT_TYPES = ['Groupage (LCL)', 'Conteneur 20’', 'Conteneur 40’', 'Conteneur 40’ HC', 'Colis express', 'Palette', 'Vrac'];

export const PAYMENT_MODES = ['Espèces', 'Virement bancaire', 'Mobile Money', 'Payé au départ', 'Payable à la livraison'];

export const CARRIER_SUGGESTIONS = [
  'AFRICHINA LOGISTICS',
  'CMA CGM',
  'MSC',
  'Maersk Line',
  'COSCO Shipping',
  'Ethiopian Cargo',
  'Turkish Cargo',
  'Qatar Airways Cargo',
  'Emirates SkyCargo',
];
