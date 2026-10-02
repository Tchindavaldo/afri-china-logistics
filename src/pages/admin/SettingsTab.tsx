import { useState, type ReactNode } from 'react';
import { Save } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { supabase, TABLES } from '../../lib/supabase';
import { useSiteSettings } from '../../context/settings-context';
import type { SiteSettings } from '../../types';
import type { ToastState } from '../../components/ui/Toast';

function Group({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{lead}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const PLACEHOLDERS = ['{nom}', '{numero}', '{origine}', '{destination}', '{societe}', '{lien}'];

export default function SettingsTab({ notify }: { notify: (t: ToastState) => void }) {
  const { settings, reload } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof SiteSettings, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const input = (key: keyof SiteSettings, props: Record<string, unknown> = {}) => ({
    id: `s-${key}`,
    className: 'input',
    value: form[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    ...props,
  });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from(TABLES.settings).upsert({ id: 1, ...form });
    setSaving(false);
    if (error) return notify({ type: 'error', message: `Enregistrement impossible : ${error.message}` });
    await reload();
    notify({ type: 'success', message: 'Paramètres enregistrés : le site est à jour.' });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Paramètres du site</h1>
          <p className="mt-1 text-muted">Coordonnées et textes affichés sur le site public.</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <Spinner /> : <Save className="size-4" />} Enregistrer
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <Group title="Entreprise" lead="Nom et présentation (pied de page, page À propos, Google).">
          <div>
            <label className="label" htmlFor="s-company_name">Nom de l'entreprise</label>
            <input {...input('company_name')} />
          </div>
          <div>
            <label className="label" htmlFor="s-opening_hours">Horaires</label>
            <input {...input('opening_hours', { placeholder: 'Lun – Sam · 8h – 18h' })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-company_description">Description</label>
            <textarea rows={3} {...input('company_description', { placeholder: 'Présentation courte de votre activité…' })} />
          </div>
        </Group>

        <Group title="Contact" lead="Affichés dans l'en-tête, le pied de page, la page Contact et le bouton WhatsApp.">
          <div>
            <label className="label" htmlFor="s-site_email">E-mail principal</label>
            <input type="email" {...input('site_email')} />
          </div>
          <div>
            <label className="label" htmlFor="s-support_email">E-mail support</label>
            <input type="email" {...input('support_email')} />
          </div>
          <div>
            <label className="label" htmlFor="s-site_phone">Téléphone</label>
            <input type="tel" {...input('site_phone', { placeholder: '+237 6XX XX XX XX' })} />
          </div>
          <div>
            <label className="label" htmlFor="s-whatsapp_phone">WhatsApp (si différent)</label>
            <input type="tel" {...input('whatsapp_phone', { placeholder: '+86 …' })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-site_address">Adresse</label>
            <input {...input('site_address')} />
          </div>
        </Group>

        <Group title="Message WhatsApp" lead="Modèle utilisé pour envoyer un numéro de suivi depuis la liste des expéditions.">
          <div>
            <label className="label" htmlFor="s-whatsapp_country_code">Indicatif par défaut</label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">+</span>
              <input {...input('whatsapp_country_code', { className: 'input pl-8 font-mono', inputMode: 'numeric' })} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-whatsapp_template">Modèle de message</label>
            <textarea rows={4} {...input('whatsapp_template')} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('whatsapp_template', `${form.whatsapp_template} ${p}`.trim())}
                  className="rounded-md bg-cobalt-50 px-2 py-1 font-mono text-xs text-cobalt-700 hover:bg-cobalt-100"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Group>
      </div>
    </div>
  );
}
