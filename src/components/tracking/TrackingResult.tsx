import { lazy, Suspense, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { MapPin, Package, Printer, User } from 'lucide-react';
import type { Shipment } from '../../types';
import { computeProgress, STAGES, TRANSPORT_LABELS } from '../../lib/tracking';
import { countryName } from '../../lib/countries';
import { formatDate } from '../../lib/format';
import { trackingUrl } from '../../lib/site';

// three.js pèse lourd : le globe n'est chargé qu'une fois un colis affiché.
const GlobeTracker = lazy(() => import('./GlobeTracker'));

function GlobeFallback() {
  return (
    <div
      className="mt-6 flex h-[420px] w-full flex-col items-center justify-center rounded-2xl border border-cobalt-700/40"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #1a2d6e 0%, #0A1B4D 62%, #06102f 100%)' }}
    >
      <svg className="mb-3 size-12 animate-spin text-cobalt-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm font-medium text-cobalt-50">Chargement du suivi…</p>
      <p className="mt-1 text-xs text-cobalt-200/80">Initialisation de la vue satellite</p>
    </div>
  );
}

function ProgressSection({ shipment }: { shipment: Shipment }) {
  const { totalDays, elapsedDays, progress, currentDay, stage } = computeProgress(shipment);

  return (
    <div className="border-b border-line bg-white p-3 sm:p-8">
      <style>{`
        @keyframes blink-day {
          0%, 100% { opacity: 1; transform: scale(1.4); box-shadow: 0 0 0 0 rgba(23, 71, 230, 0.7); }
          50% { opacity: 0.6; transform: scale(1.7); box-shadow: 0 0 0 8px rgba(23, 71, 230, 0); }
        }
        .blink-day { animation: blink-day 1s ease-in-out infinite; }
      `}</style>
      <h3 className="mb-4 text-center font-display text-xl font-bold text-ink sm:mb-6 sm:text-2xl">
        Progression du colis
      </h3>
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex justify-between gap-1">
          {STAGES.map((s) => (
            <div
              key={s.key}
              className={`min-w-0 flex-1 text-center transition-all ${
                stage === s.key ? 'font-bold text-cobalt-500 sm:scale-110' : 'text-muted/60'
              }`}
            >
              <div className="mb-1 text-xl sm:mb-2 sm:text-2xl">{s.icon}</div>
              <div className="text-[9px] leading-tight font-semibold sm:text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-2 h-3 overflow-hidden rounded-full bg-cobalt-50 shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cobalt-400 to-cobalt-600 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {totalDays > 0 && (
          <div className="relative mt-4 mb-8 px-1">
            <div className="relative h-1 rounded-full bg-cobalt-100">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-cobalt-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
              {Array.from({ length: totalDays }, (_, i) => {
                const dayNumber = i + 1;
                const leftPct = totalDays === 1 ? 50 : (i / (totalDays - 1)) * 100;
                const isPast = dayNumber < currentDay;
                const isCurrent = dayNumber === currentDay;
                const dotColor = isPast
                  ? 'bg-cobalt-500 border-cobalt-500'
                  : isCurrent
                    ? 'bg-cobalt-500 border-cobalt-700 blink-day'
                    : 'bg-white border-cobalt-200';
                const labelColor = isPast
                  ? 'text-cobalt-500 font-semibold'
                  : isCurrent
                    ? 'text-cobalt-600 font-bold'
                    : 'text-muted';
                return (
                  <div
                    key={dayNumber}
                    className="absolute"
                    style={{ left: `${leftPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={`size-3 rounded-full border-2 ${dotColor}`} />
                    {(totalDays <= 30 || isCurrent || dayNumber === 1 || dayNumber === totalDays) && (
                      <div
                        className={`absolute font-mono text-[10px] whitespace-nowrap ${labelColor}`}
                        style={{ top: '14px', left: '50%', transform: 'translateX(-50%)' }}
                      >
                        J{dayNumber}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 text-center text-sm font-bold text-cobalt-500">
          {progress}% effectué
          {totalDays > 0 && (
            <span className="ml-2 font-medium text-muted">
              · Jour {currentDay} / {totalDays} ({Math.max(0, totalDays - elapsedDays)} jours restants)
            </span>
          )}
        </div>

        <Suspense fallback={<GlobeFallback />}>
          <GlobeTracker
            originCountry={shipment.origin_country}
            destinationCountry={shipment.destination_country}
            transportMode={shipment.transport_mode}
            progress={progress}
          />
        </Suspense>
      </div>
    </div>
  );
}

function PaidBadge({ paid, unpaidTone = 'amber' }: { paid: boolean; unpaidTone?: 'amber' | 'red' }) {
  const unpaid = unpaidTone === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
  return (
    <span className={`ml-2 rounded-full px-2.5 py-1 text-xs font-bold ${paid ? 'bg-green-100 text-green-700' : unpaid}`}>
      {paid ? 'PAYÉ' : 'NON PAYÉ'}
    </span>
  );
}

function Detail({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-muted">{label}</p>
      <p className={`font-medium break-words ${accent ? 'text-cobalt-500' : 'text-ink'}`}>{value === '' ? '—' : value}</p>
    </div>
  );
}

function PartyCard({ title, name, address, phone, email }: { title: string; name: string; address: string; phone: string; email: string }) {
  return (
    <div className="print-break-avoid rounded-xl border-2 border-line bg-white p-4 shadow-sm transition-all hover:border-cobalt-300 hover:shadow-md sm:p-6">
      <h3 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-ink">
        <User size={24} className="text-cobalt-500" />
        {title}
      </h3>
      <div className="space-y-4 text-sm">
        <Detail label="Nom" value={name} />
        <Detail label="Adresse" value={address} />
        <Detail label="Téléphone" value={phone} />
        <Detail label="E-mail" value={email} />
      </div>
    </div>
  );
}

function LocationMap({ shipment }: { shipment: Shipment }) {
  const [side, setSide] = useState<'origin' | 'destination'>('origin');
  const city = side === 'origin' ? shipment.origin : shipment.destination;
  const country = countryName(side === 'origin' ? shipment.origin_country : shipment.destination_country);
  const query = [city, country].filter(Boolean).join(', ');

  return (
    <div className="print-break-avoid mb-8 rounded-xl border-2 border-line bg-white p-4 shadow-sm sm:p-6" data-print-hide>
      <h3 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-ink">
        <MapPin size={24} className="text-cobalt-500" />
        Carte de localisation{country ? ` — ${country}` : ''}
      </h3>

      <div className="mb-4 rounded-xl border border-cobalt-100 bg-gradient-to-r from-cobalt-50 to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className={`size-3 animate-pulse rounded-full shadow-lg ${side === 'origin' ? 'bg-green-500' : 'bg-cobalt-500'}`} />
            <span className="font-bold text-ink">
              {side === 'origin' ? 'Origine' : 'Destination'} : {city || '—'}
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-cobalt-100 bg-white p-0.5 text-xs font-semibold">
            {(['origin', 'destination'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`rounded-md px-3 py-1.5 transition ${side === s ? 'bg-cobalt-500 text-white' : 'text-muted hover:text-ink'}`}
              >
                {s === 'origin' ? 'Départ' : 'Arrivée'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-line shadow-sm" style={{ height: 400 }}>
        {query ? (
          <iframe
            key={query}
            src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${city ? 11 : 5}&hl=fr&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Carte — ${query}`}
          />
        ) : (
          <div className="grid h-full place-items-center bg-cobalt-50 text-sm text-muted">Localisation non renseignée</div>
        )}
      </div>

      <div className="mt-4 text-center text-sm font-medium text-muted">
        <p>
          📍 {side === 'origin' ? 'Lieu de départ' : "Lieu d'arrivée"} : <strong className="text-ink">{query || '—'}</strong>
        </p>
      </div>
    </div>
  );
}

export default function TrackingResult({ shipment }: { shipment: Shipment }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(trackingUrl(shipment.tracking_number), {
      width: 240,
      margin: 2,
      color: { dark: '#0A1B4D', light: '#FFFFFF' },
    })
      .then((url) => !cancelled && setQrCodeUrl(url))
      .catch((err) => console.error('QR code :', err));
    return () => {
      cancelled = true;
    };
  }, [shipment.tracking_number]);

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cobalt-50/60 to-white shadow-[0_30px_60px_-30px_rgba(10,27,77,0.35)]">
      {/* Progression visuelle + globe */}
      <ProgressSection shipment={shipment} />

      {/* Statut courant */}
      <div className="border-b border-line bg-white p-3 sm:p-8">
        <div className="rounded-xl border-2 border-cobalt-500/20 bg-gradient-to-br from-cobalt-50/70 to-white p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <div className="font-display text-xl font-bold text-ink">{formatDate(shipment.status_date)}</div>
            <span className="font-mono text-sm font-medium text-muted">{shipment.status_time || 'N/A'}</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-1 size-4 shrink-0 animate-pulse rounded-full bg-cobalt-500 shadow-lg" />
            <div className="flex-1">
              <strong className="mb-3 block text-lg font-bold text-cobalt-500">{shipment.status || 'En cours de traitement'}</strong>

              {shipment.insurances?.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-sm font-bold text-ink">Assurances :</p>
                  {shipment.insurances.map((insurance, index) => (
                    <div key={index} className="mb-2 ml-2 flex flex-wrap items-center gap-2 text-sm text-ink/80">
                      <span className="size-1.5 rounded-full bg-cobalt-500" />
                      {insurance.name} : {insurance.amount}
                      <PaidBadge paid={insurance.paid} />
                    </div>
                  ))}
                </div>
              )}

              {shipment.import_tax && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink/80">
                  <span className="font-bold text-ink">Taxe d'importation :</span> {shipment.import_tax}
                  <PaidBadge paid={shipment.import_tax_paid} unpaidTone="red" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-8">
        {/* QR code */}
        <div className="mb-10 flex items-center justify-center">
          <div className="rounded-xl border-2 border-cobalt-500/25 bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
            {qrCodeUrl ? (
              <div className="text-center">
                <img src={qrCodeUrl} alt={`QR code du suivi ${shipment.tracking_number}`} className="mx-auto mb-3" style={{ width: 120, height: 120 }} />
                <p className="rounded-lg bg-cobalt-50 px-3 py-1.5 text-center font-mono text-xs font-bold text-ink">{shipment.tracking_number}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ width: 120, height: 120 }}>
                <svg className="mb-2 size-8 animate-spin text-cobalt-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-xs text-muted">QR code…</p>
              </div>
            )}
          </div>
        </div>

        {/* Expéditeur / destinataire */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PartyCard
            title="Expéditeur"
            name={shipment.shipper_name}
            address={shipment.shipper_address}
            phone={shipment.shipper_phone}
            email={shipment.shipper_email}
          />
          <PartyCard
            title="Destinataire"
            name={shipment.receiver_name}
            address={shipment.receiver_address}
            phone={shipment.receiver_phone}
            email={shipment.receiver_email}
          />
        </div>

        {/* Informations de l'expédition */}
        <div className="print-break-avoid mb-8 rounded-xl border-2 border-line bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-5 border-b-2 border-cobalt-500/15 pb-3 font-display text-xl font-bold text-ink">
            Informations de l'expédition
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Detail label="Origine" value={shipment.origin} />
            <Detail label="Colis" value={shipment.package_description || shipment.product} />
            <Detail label="Statut" value={shipment.status} accent />
            <Detail label="Destination" value={shipment.destination} />
            <Detail label="Transporteur" value={shipment.carrier} />
            <Detail label="Type d'expédition" value={shipment.type_of_shipment} />
            <Detail label="Poids" value={shipment.weight} />
            <Detail label="Mode d'expédition" value={TRANSPORT_LABELS[shipment.transport_mode] ?? ''} />
            <Detail label="Réf. transporteur" value={shipment.carrier_reference} />
            <Detail label="Produit" value={shipment.product} />
            <Detail label="Quantité" value={shipment.quantity} />
            <Detail label="Mode de paiement" value={shipment.payment_mode} />
            <Detail label="Fret total" value={shipment.total_freight} />
            <Detail label="Livraison prévue" value={formatDate(shipment.expected_delivery_date)} />
            <Detail label="Date de départ" value={formatDate(shipment.departure_date)} />
            <Detail label="Heure de départ" value={shipment.departure_time} />
            <Detail label="Heure de livraison" value={shipment.delivery_time} />
          </div>
        </div>

        {shipment.comment && (
          <div className="print-break-avoid mb-8 rounded-r-xl border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-sm">
            <p className="mb-2 flex items-center gap-2 font-bold text-amber-800">
              <span className="text-lg">⚠️</span> Information importante
            </p>
            <p className="whitespace-pre-line text-amber-900">{shipment.comment}</p>
          </div>
        )}

        {shipment.image_url && (
          <div className="print-break-avoid mb-8 rounded-xl border-2 border-line bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
              <Package size={24} className="text-cobalt-500" />
              Photo de l'expédition
            </h3>
            <img src={shipment.image_url} alt="Photo de l'expédition" className="mx-auto w-full max-w-2xl rounded-xl shadow-lg" />
          </div>
        )}

        <LocationMap shipment={shipment} />
      </div>

      <div className="bg-gradient-to-r from-cobalt-700 to-cobalt-500 p-6 text-center" data-print-hide>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-3.5 font-bold text-cobalt-700 shadow-lg transition-all hover:scale-105 hover:bg-cobalt-50"
        >
          <Printer className="size-5" />
          Imprimer le bordereau
        </button>
      </div>
    </div>
  );
}
