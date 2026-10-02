import { useEffect, useState, type ReactNode } from 'react';
import { CalendarClock, ImagePlus, Plus, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import ComboInput from '../../components/ComboInput';
import CountrySelect from '../../components/CountrySelect';
import Spinner from '../../components/ui/Spinner';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER, TABLES } from '../../lib/supabase';
import { countryName } from '../../lib/countries';
import { DURATION_RULES, generateTrackingNumber, STAGES } from '../../lib/tracking';
import { cn, errorMessage } from '../../lib/format';
import type { Shipment, ShipmentInput, TransportMode } from '../../types';
import {
  autoValues,
  CARRIER_SUGGESTIONS,
  emptyForm,
  PAYMENT_MODES,
  SHIPMENT_TYPES,
  STATUS_SUGGESTIONS,
  toForm,
  toPayload,
  validate,
  type FormErrors,
} from './shipmentForm';
import type { ToastState } from '../../components/ui/Toast';

interface ShipmentFormProps {
  /** null = création ; sinon id de l'expédition à modifier. */
  editingId: string | null;
  onClose: () => void;
  onSaved: (trackingNumber: string, created: boolean) => void;
  notify: (t: ToastState) => void;
}

function Section({ index, title, children, aside }: { index: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-7 sm:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h4 className="flex items-baseline gap-3 font-display text-lg font-bold text-ink">
          <span className="font-mono text-xs text-cobalt-500">{index}</span>
          {title}
        </h4>
        {aside}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  className,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function ShipmentForm({ editingId, onClose, onSaved, notify }: ShipmentFormProps) {
  const [form, setForm] = useState<ShipmentInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(!!editingId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;
    supabase
      .from(TABLES.shipments)
      .select('*')
      .eq('id', editingId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          notify({ type: 'error', message: 'Expédition introuvable.' });
          onClose();
          return;
        }
        setForm(toForm(data as Shipment));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editingId, notify, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const set = <K extends keyof ShipmentInput>(key: K, value: ShipmentInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const auto = autoValues(form);
  const inputCls = (key: keyof ShipmentInput) => cn('input', errors[key] && 'input-error');
  const text = (key: keyof ShipmentInput, props: Record<string, unknown> = {}) => ({
    id: `f-${key}`,
    className: inputCls(key),
    value: String(form[key] ?? ''),
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    ...props,
  });

  const nowStatus = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    set('status_date', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    set('status_time', `${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  const pickCountry = (side: 'origin' | 'destination', code: string) => {
    set(`${side}_country`, code);
    // Ville vide : on propose le nom du pays, modifiable ensuite.
    if (!form[side].trim()) set(side, countryName(code));
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return notify({ type: 'error', message: 'Choisissez un fichier image.' });
    if (file.size > MAX_IMAGE_BYTES) return notify({ type: 'error', message: "L'image doit faire moins de 5 Mo." });
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${STORAGE_FOLDER}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      set('image_url', data.publicUrl);
    } catch (err) {
      notify({ type: 'error', message: `Envoi de l'image impossible : ${errorMessage(err)}` });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      notify({ type: 'error', message: 'Certains champs sont à corriger.' });
      document.querySelector('[data-form-scroll] .input-error, [data-form-scroll] .field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true);
    const payload = toPayload(form);
    const { error } = editingId
      ? await supabase.from(TABLES.shipments).update(payload).eq('id', editingId)
      : await supabase.from(TABLES.shipments).insert(payload);
    setSaving(false);
    if (error) {
      if (error.code === '23505') {
        setErrors({ tracking_number: 'Ce numéro de suivi existe déjà.' });
        notify({ type: 'error', message: 'Ce numéro de suivi existe déjà : générez-en un autre.' });
      } else {
        notify({ type: 'error', message: `Enregistrement impossible : ${error.message}` });
      }
      return;
    }
    onSaved(payload.tracking_number, !editingId);
  };

  const durationHint =
    form.transport_mode === 'air'
      ? `✈️ Aérien : ${DURATION_RULES.airMaxDays} jours maximum.`
      : `🚢 Maritime : ${DURATION_RULES.seaMinDays} jours minimum.`;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label={editingId ? "Modifier l'expédition" : 'Nouvelle expédition'}>
      <button type="button" className="absolute inset-0 bg-cobalt-950/45 backdrop-blur-[2px]" onClick={() => !saving && onClose()} aria-label="Fermer" />

      <div className="relative flex h-full w-full max-w-3xl animate-slide-in flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{editingId ? 'Modification' : 'Création'}</p>
            <h3 className="font-display text-xl font-bold text-ink">{editingId ? form.tracking_number || 'Expédition' : 'Nouvelle expédition'}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-muted hover:bg-cobalt-50 hover:text-ink" aria-label="Fermer">
            <X className="size-6" />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-cobalt-500">
            <Spinner className="size-9" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto" data-form-scroll>
            <Section index="01" title="Référence & statut">
              <Field label="Numéro de suivi" required error={errors.tracking_number} htmlFor="f-tracking_number" className="sm:col-span-2">
                <div className="flex gap-2">
                  <input {...text('tracking_number')} className={cn(inputCls('tracking_number'), 'font-mono uppercase')} />
                  <button type="button" onClick={() => set('tracking_number', generateTrackingNumber())} className="btn btn-outline shrink-0" title="Générer un numéro">
                    <RefreshCw className="size-4" /> <span className="hidden sm:inline">Générer</span>
                  </button>
                </div>
              </Field>
              <Field label="Statut affiché au client" hint="Choisissez une suggestion ou écrivez librement." className="sm:col-span-2" htmlFor="f-status">
                <ComboInput id="f-status" className={inputCls('status')} value={form.status} onChange={(v) => set('status', v)} options={STATUS_SUGGESTIONS} placeholder="Ex. : Embarqué — en mer" />
              </Field>
              <Field label="Date du statut" required error={errors.status_date} htmlFor="f-status_date">
                <input type="date" {...text('status_date')} />
              </Field>
              <Field label="Heure du statut" required error={errors.status_time} htmlFor="f-status_time">
                <div className="flex gap-2">
                  <input type="time" {...text('status_time')} />
                  <button type="button" onClick={nowStatus} className="btn btn-outline shrink-0 px-3" title="Maintenant">
                    <CalendarClock className="size-4" />
                  </button>
                </div>
              </Field>
            </Section>

            <Section index="02" title="Itinéraire">
              <Field label="Pays d'origine" required error={errors.origin_country}>
                <CountrySelect value={form.origin_country} onChange={(c) => pickCountry('origin', c)} hasError={!!errors.origin_country} />
              </Field>
              <Field label="Ville d'origine" required error={errors.origin} htmlFor="f-origin">
                <input {...text('origin', { placeholder: 'Guangzhou' })} />
              </Field>
              <Field label="Pays de destination" required error={errors.destination_country}>
                <CountrySelect value={form.destination_country} onChange={(c) => pickCountry('destination', c)} hasError={!!errors.destination_country} />
              </Field>
              <Field label="Ville de destination" required error={errors.destination} htmlFor="f-destination">
                <input {...text('destination', { placeholder: 'Douala' })} />
              </Field>
              <Field label="Mode de transport" required className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['sea', 'air'] as TransportMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('transport_mode', m)}
                      className={cn(
                        'h-12 rounded-[10px] border text-sm font-semibold transition',
                        form.transport_mode === m ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-line text-ink hover:border-cobalt-300'
                      )}
                    >
                      {m === 'sea' ? '🚢 Maritime (bateau)' : '✈️ Aérien (avion)'}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Transporteur" required error={errors.carrier} htmlFor="f-carrier">
                <ComboInput id="f-carrier" className={inputCls('carrier')} value={form.carrier} onChange={(v) => set('carrier', v)} options={CARRIER_SUGGESTIONS} />
              </Field>
              <Field label="Réf. transporteur (B/L, AWB…)" htmlFor="f-carrier_reference">
                <input {...text('carrier_reference')} />
              </Field>
            </Section>

            <Section index="03" title="Marchandise">
              <Field label="Produit" htmlFor="f-product">
                <input {...text('product', { placeholder: 'Ex. : pièces auto' })} />
              </Field>
              <Field label="Type d'expédition" htmlFor="f-type_of_shipment">
                <ComboInput id="f-type_of_shipment" className={inputCls('type_of_shipment')} value={form.type_of_shipment} onChange={(v) => set('type_of_shipment', v)} options={SHIPMENT_TYPES} />
              </Field>
              <Field label="Description du colis" className="sm:col-span-2" htmlFor="f-package_description">
                <input {...text('package_description', { placeholder: 'Ex. : 12 cartons, palette filmée' })} />
              </Field>
              <Field label="Quantité" error={errors.quantity} htmlFor="f-quantity">
                <input
                  id="f-quantity"
                  type="number"
                  min={0}
                  className={inputCls('quantity')}
                  value={form.quantity}
                  onChange={(e) => set('quantity', Math.max(0, parseInt(e.target.value, 10) || 0))}
                />
              </Field>
              <Field label="Poids" htmlFor="f-weight">
                <input {...text('weight', { placeholder: 'Ex. : 350 kg' })} />
              </Field>
            </Section>

            <Section
              index="04"
              title="Calendrier & progression"
              aside={
                auto.automatic ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cobalt-50 px-3 py-1 text-xs font-semibold text-cobalt-700">
                    <Sparkles className="size-3.5" /> Automatique
                  </span>
                ) : undefined
              }
            >
              <Field label="Date de départ" required error={errors.departure_date} htmlFor="f-departure_date">
                <input type="date" {...text('departure_date')} />
              </Field>
              <Field label="Heure de départ" htmlFor="f-departure_time">
                <input {...text('departure_time', { placeholder: 'Ex. : 13:30' })} />
              </Field>
              <Field
                label="Arrivée prévue"
                required
                error={errors.expected_delivery_date}
                hint={`${durationHint} La durée, l'étape et la progression se calculent avec ces deux dates.`}
                htmlFor="f-expected_delivery_date"
              >
                <input
                  id="f-expected_delivery_date"
                  type="date"
                  min={form.departure_date || undefined}
                  className={inputCls('expected_delivery_date')}
                  value={form.expected_delivery_date}
                  onChange={(e) => set('expected_delivery_date', e.target.value)}
                />
              </Field>
              <Field label="Heure d'arrivée" htmlFor="f-delivery_time">
                <input {...text('delivery_time', { placeholder: 'Ex. : 15:00' })} />
              </Field>
              <Field label="Durée du trajet" hint="Calculée automatiquement." htmlFor="f-total_duration_days">
                <input
                  id="f-total_duration_days"
                  className="input bg-cobalt-50/60 font-semibold"
                  readOnly
                  tabIndex={-1}
                  value={auto.automatic ? `${auto.total_duration_days} jour${auto.total_duration_days > 1 ? 's' : ''}` : '—'}
                />
              </Field>
              <Field label="Étape" hint="Calculée selon la progression du jour." htmlFor="f-stage">
                <select
                  id="f-stage"
                  className="input"
                  value={auto.tracking_stage}
                  disabled
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Progression : ${auto.tracking_progress}%`} hint="Avance seule chaque jour entre le départ et l'arrivée.">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={auto.tracking_progress}
                  disabled
                  readOnly
                  className="mt-3 w-full accent-cobalt-500 disabled:opacity-60"
                />
              </Field>
            </Section>

            <Section index="05" title="Frais">
              <Field label="Fret total" htmlFor="f-total_freight">
                <input {...text('total_freight', { placeholder: 'Ex. : 450 000 FCFA' })} />
              </Field>
              <Field label="Mode de paiement" htmlFor="f-payment_mode">
                <ComboInput id="f-payment_mode" className={inputCls('payment_mode')} value={form.payment_mode} onChange={(v) => set('payment_mode', v)} options={PAYMENT_MODES} />
              </Field>
              <Field label="Assurances" error={errors.insurances} className="sm:col-span-2">
                <div className="space-y-2.5">
                  {form.insurances.map((ins, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 rounded-xl bg-cobalt-50/60 p-2.5">
                      <input
                        className="input h-10 bg-white"
                        placeholder="Nom (ex. : Ad valorem)"
                        value={ins.name}
                        onChange={(e) => set('insurances', form.insurances.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      />
                      <input
                        className="input h-10 bg-white"
                        placeholder="Montant"
                        value={ins.amount}
                        onChange={(e) => set('insurances', form.insurances.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                      />
                      <label className="flex items-center gap-1.5 px-1 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          className="size-4 accent-cobalt-500"
                          checked={ins.paid}
                          onChange={(e) => set('insurances', form.insurances.map((x, j) => (j === i ? { ...x, paid: e.target.checked } : x)))}
                        />
                        Payée
                      </label>
                      <button
                        type="button"
                        onClick={() => set('insurances', form.insurances.filter((_, j) => j !== i))}
                        className="rounded-lg p-2 text-muted hover:bg-white hover:text-red-600"
                        aria-label="Retirer l'assurance"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => set('insurances', [...form.insurances, { name: '', amount: '', paid: false }])}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-line text-sm font-semibold text-muted transition hover:border-cobalt-300 hover:text-cobalt-600"
                  >
                    <Plus className="size-4" /> Ajouter une assurance
                  </button>
                </div>
              </Field>
              <Field label="Taxe d'importation" htmlFor="f-import_tax">
                <input {...text('import_tax', { placeholder: 'Ex. : 150 000 FCFA' })} />
              </Field>
              <Field label="Statut de la taxe">
                <label className="flex h-12 items-center gap-2.5 rounded-[10px] border border-line px-4 text-sm font-medium text-ink">
                  <input type="checkbox" className="size-4 accent-cobalt-500" checked={form.import_tax_paid} onChange={(e) => set('import_tax_paid', e.target.checked)} />
                  Taxe payée
                </label>
              </Field>
            </Section>

            {(['shipper', 'receiver'] as const).map((p, idx) => (
              <Section key={p} index={idx === 0 ? '06' : '07'} title={p === 'shipper' ? 'Expéditeur' : 'Destinataire'}>
                <Field label="Nom" required error={errors[`${p}_name`]} htmlFor={`f-${p}_name`}>
                  <input {...text(`${p}_name`, { autoComplete: 'off' })} />
                </Field>
                <Field label="Téléphone" required error={errors[`${p}_phone`]} htmlFor={`f-${p}_phone`}>
                  <input type="tel" {...text(`${p}_phone`, { placeholder: '+237 6XX XX XX XX' })} />
                </Field>
                <Field
                  label="E-mail"
                  required
                  error={errors[`${p}_email`]}
                  hint="Permet au client de retrouver ce colis dans son espace."
                  htmlFor={`f-${p}_email`}
                >
                  <input type="email" {...text(`${p}_email`, { placeholder: 'exemple@email.com' })} />
                </Field>
                <Field label="Adresse" htmlFor={`f-${p}_address`}>
                  <input {...text(`${p}_address`)} />
                </Field>
              </Section>
            ))}

            <Section index="08" title="Note & photo">
              <Field label="Information importante (affichée en encadré)" className="sm:col-span-2" htmlFor="f-comment">
                <textarea rows={3} {...text('comment')} />
              </Field>
              <div className="sm:col-span-2">
                <span className="label">Photo de l'expédition</span>
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} alt="Aperçu" className="max-h-56 rounded-xl border border-line" />
                    <button
                      type="button"
                      onClick={() => set('image_url', '')}
                      className="absolute top-2 right-2 rounded-full bg-white p-1.5 text-ink shadow hover:text-red-600"
                      aria-label="Retirer la photo"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-line px-6 py-8 text-center transition hover:border-cobalt-300 hover:bg-cobalt-50/40">
                    {uploading ? <Spinner className="size-7 text-cobalt-500" /> : <ImagePlus className="size-7 text-cobalt-500" />}
                    <span className="text-sm font-semibold text-ink">{uploading ? 'Envoi en cours…' : 'Ajouter une photo'}</span>
                    <span className="text-xs text-muted">JPG, PNG ou WebP · 5 Mo maximum</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadImage(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            </Section>
          </div>
        )}

        <footer className="flex items-center justify-end gap-3 border-t border-line bg-white px-5 py-4 sm:px-8">
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-outline">
            Annuler
          </button>
          <button type="button" onClick={submit} disabled={saving || uploading || loading} className="btn btn-primary">
            {saving && <Spinner />} {editingId ? 'Enregistrer' : "Créer l'expédition"}
          </button>
        </footer>
      </div>
    </div>
  );
}
