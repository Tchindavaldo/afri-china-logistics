import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, ExternalLink, Package, Pencil, Plane, Plus, Search, Ship, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import StageBadge from '../../components/StageBadge';
import WhatsAppIcon from '../../components/ui/WhatsAppIcon';
import ShipmentForm from './ShipmentForm';
import WhatsAppModal, { type WhatsAppTarget } from './WhatsAppModal';
import { supabase, TABLES } from '../../lib/supabase';
import { computeProgress, STAGES } from '../../lib/tracking';
import { countryName, flag } from '../../lib/countries';
import { trackingUrl } from '../../lib/site';
import { cn, formatShortDate } from '../../lib/format';
import type { Shipment, TrackingStage } from '../../types';
import type { ToastState } from '../../components/ui/Toast';

type Row = Pick<
  Shipment,
  | 'id'
  | 'tracking_number'
  | 'status'
  | 'origin'
  | 'origin_country'
  | 'destination'
  | 'destination_country'
  | 'transport_mode'
  | 'shipper_name'
  | 'receiver_name'
  | 'receiver_phone'
  | 'departure_date'
  | 'total_duration_days'
  | 'tracking_progress'
  | 'tracking_stage'
  | 'created_at'
>;

const COLUMNS =
  'id, tracking_number, status, origin, origin_country, destination, destination_country, transport_mode, shipper_name, receiver_name, receiver_phone, departure_date, total_duration_days, tracking_progress, tracking_stage, created_at';

const PAGE_SIZE = 10;

export default function ShipmentsTab({ notify }: { notify: (t: ToastState) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<TrackingStage | 'all'>('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppTarget | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(TABLES.shipments).select(COLUMNS).order('created_at', { ascending: false });
    if (error) notify({ type: 'error', message: `Chargement impossible : ${error.message}` });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis Supabase
    void load();
  }, [load]);

  const enriched = useMemo(() => rows.map((r) => ({ ...r, info: computeProgress(r) })), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((r) => {
      if (stageFilter !== 'all' && r.info.stage !== stageFilter) return false;
      if (!q) return true;
      return [r.tracking_number, r.status, r.origin, r.destination, r.shipper_name, r.receiver_name, countryName(r.destination_country)].some((v) =>
        v?.toLowerCase().includes(q)
      );
    });
  }, [enriched, search, stageFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kpis = [
    { icon: Package, label: 'Expéditions', value: enriched.length },
    { icon: Ship, label: 'En transit', value: enriched.filter((r) => r.info.stage === 'in_transit').length },
    { icon: Truck, label: 'Douane / livraison', value: enriched.filter((r) => r.info.stage === 'customs' || r.info.stage === 'out_for_delivery').length },
    { icon: CheckCircle2, label: 'Livrées', value: enriched.filter((r) => r.info.stage === 'delivered').length },
  ];

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };
  const closeForm = useCallback(() => setFormOpen(false), []);

  const onSaved = (trackingNumber: string, isNew: boolean) => {
    setFormOpen(false);
    void load();
    if (isNew) setCreated(trackingNumber);
    else notify({ type: 'success', message: 'Expédition mise à jour.' });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from(TABLES.shipments).delete().eq('id', toDelete.id);
    setDeleting(false);
    if (error) return notify({ type: 'error', message: `Suppression impossible : ${error.message}` });
    setRows((r) => r.filter((x) => x.id !== toDelete.id));
    setToDelete(null);
    notify({ type: 'success', message: 'Expédition supprimée.' });
  };

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify({ type: 'success', message });
    } catch {
      notify({ type: 'error', message: 'Copie impossible sur ce navigateur.' });
    }
  };

  const createdRow = created ? rows.find((r) => r.tracking_number === created) : undefined;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Expéditions</h1>
          <p className="mt-1 text-muted">Créez, modifiez et partagez les numéros de suivi.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="size-5" /> Nouvelle expédition
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-cobalt-50 text-cobalt-500">
              <k.icon className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{k.value}</p>
              <p className="text-xs text-muted">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted/70" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher : numéro, client, ville…"
            className="input pl-11"
          />
        </div>
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          {[{ key: 'all' as const, label: 'Toutes' }, ...STAGES].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setStageFilter(s.key);
                setPage(1);
              }}
              className={cn(
                'h-12 shrink-0 rounded-[10px] border px-4 text-sm font-semibold transition',
                stageFilter === s.key ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-line bg-white text-ink hover:border-cobalt-300'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20 text-cobalt-500">
            <Spinner className="size-8" />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto size-10 text-cobalt-200" />
            <p className="mt-4 font-semibold text-ink">{rows.length === 0 ? 'Aucune expédition pour le moment' : 'Aucun résultat'}</p>
            {rows.length === 0 && (
              <button type="button" onClick={openCreate} className="btn btn-primary mt-6">
                <Plus className="size-4" /> Créer la première
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-line bg-cobalt-50/60 text-left font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">
                <tr>
                  <th className="sticky left-0 z-10 bg-cobalt-50 px-5 py-3 shadow-[1px_0_0_var(--color-line)]">N° de suivi</th>
                  <th className="px-4 py-3">Trajet</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Expéditeur</th>
                  <th className="px-4 py-3">Destinataire</th>
                  <th className="px-4 py-3">Créée</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((r) => {
                  const ModeIcon = r.transport_mode === 'air' ? Plane : Ship;
                  return (
                    <tr key={r.id} className="group hover:bg-cobalt-50/40">
                      <td className="sticky left-0 z-10 bg-white px-5 py-3.5 shadow-[1px_0_0_var(--color-line)] group-hover:bg-cobalt-50">
                        <button type="button" onClick={() => openEdit(r.id)} className="font-mono font-semibold text-ink hover:text-cobalt-600">
                          {r.tracking_number}
                        </button>
                        <p className="max-w-[200px] truncate text-xs text-muted">{r.status || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-ink">
                          <ModeIcon className="size-4 text-cobalt-400" />
                          {flag(r.origin_country)} {r.origin}
                          <span className="text-cobalt-300">→</span>
                          {flag(r.destination_country)} {r.destination}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <StageBadge stage={r.info.stage} />
                          <span className="font-mono text-xs text-muted">{r.info.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-ink">{r.shipper_name}</td>
                      <td className="px-4 py-3.5 text-ink">{r.receiver_name}</td>
                      <td className="px-4 py-3.5 text-muted">{formatShortDate(r.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setWhatsapp(r)} className="rounded-lg p-2 text-muted hover:bg-white hover:text-emerald-600" title="Envoyer par WhatsApp">
                            <WhatsAppIcon className="size-[18px]" />
                          </button>
                          <button type="button" onClick={() => copy(trackingUrl(r.tracking_number), 'Lien de suivi copié.')} className="rounded-lg p-2 text-muted hover:bg-white hover:text-ink" title="Copier le lien de suivi">
                            <Copy className="size-[18px]" />
                          </button>
                          <Link to={`/track?tracking=${encodeURIComponent(r.tracking_number)}`} target="_blank" className="rounded-lg p-2 text-muted hover:bg-white hover:text-ink" title="Voir le suivi public">
                            <ExternalLink className="size-[18px]" />
                          </Link>
                          <button type="button" onClick={() => openEdit(r.id)} className="rounded-lg p-2 text-muted hover:bg-white hover:text-cobalt-600" title="Modifier">
                            <Pencil className="size-[18px]" />
                          </button>
                          <button type="button" onClick={() => setToDelete(r)} className="rounded-lg p-2 text-muted hover:bg-white hover:text-red-600" title="Supprimer">
                            <Trash2 className="size-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
            <span className="text-muted">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg p-2 hover:bg-cobalt-50 disabled:opacity-40" aria-label="Page précédente">
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 font-mono text-xs">
                {currentPage} / {pageCount}
              </span>
              <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg p-2 hover:bg-cobalt-50 disabled:opacity-40" aria-label="Page suivante">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && <ShipmentForm editingId={editingId} onClose={closeForm} onSaved={onSaved} notify={notify} />}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Supprimer l'expédition ?" locked={deleting}>
        <p className="text-muted">
          L'expédition <span className="font-mono font-semibold text-ink">{toDelete?.tracking_number}</span> sera définitivement supprimée et
          son lien de suivi ne fonctionnera plus.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setToDelete(null)} disabled={deleting} className="btn btn-outline flex-1">
            Annuler
          </button>
          <button type="button" onClick={confirmDelete} disabled={deleting} className="btn flex-1 bg-red-600 text-white hover:bg-red-700">
            {deleting && <Spinner />} Supprimer
          </button>
        </div>
      </Modal>

      <Modal open={!!created} onClose={() => setCreated(null)}>
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-ink">Expédition créée</h3>
          <p className="mt-2 text-muted">Communiquez ce numéro au client pour qu'il suive son colis.</p>
          <p className="mt-5 rounded-xl border-2 border-cobalt-100 bg-cobalt-50 py-4 font-mono text-2xl font-semibold text-cobalt-600 select-all">{created}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => created && copy(created, 'Numéro copié.')} className="btn btn-outline">
              <Copy className="size-4" /> Copier
            </button>
            <button
              type="button"
              disabled={!createdRow}
              onClick={() => {
                if (createdRow) setWhatsapp(createdRow);
                setCreated(null);
              }}
              className="btn btn-primary"
            >
              <WhatsAppIcon className="size-5" /> WhatsApp
            </button>
          </div>
        </div>
      </Modal>

      {whatsapp && <WhatsAppModal target={whatsapp} onClose={() => setWhatsapp(null)} />}
    </div>
  );
}
