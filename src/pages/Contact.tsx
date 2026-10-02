import { useState, type FormEvent } from 'react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import Reveal from '../components/ui/Reveal';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import { useSiteSettings } from '../context/settings-context';
import { COUNTRIES, REGIONS } from '../lib/countries';
import { whatsappLink } from '../lib/site';
import { cn } from '../lib/format';

interface QuoteForm {
  name: string;
  phone: string;
  email: string;
  origin: string;
  destination: string;
  mode: 'sea' | 'air' | 'unknown';
  goods: string;
  weight: string;
  volume: string;
  message: string;
}

const EMPTY: QuoteForm = {
  name: '',
  phone: '',
  email: '',
  origin: '',
  destination: 'CM',
  mode: 'unknown',
  goods: '',
  weight: '',
  volume: '',
  message: '',
};

const MODE_LABEL: Record<QuoteForm['mode'], string> = {
  sea: 'Maritime',
  air: 'Aérien',
  unknown: 'À conseiller',
};

function buildMessage(f: QuoteForm): string {
  const dest = COUNTRIES.find((c) => c.code === f.destination)?.name ?? f.destination;
  const lines: (string | null)[] = [
    'Demande de devis',
    '',
    `Nom : ${f.name}`,
    f.phone ? `Téléphone : ${f.phone}` : null,
    f.email ? `E-mail : ${f.email}` : null,
    '',
    `Départ (Chine) : ${f.origin || 'à préciser'}`,
    `Destination : ${dest}`,
    `Mode souhaité : ${MODE_LABEL[f.mode]}`,
    `Marchandise : ${f.goods}`,
    f.weight ? `Poids : ${f.weight} kg` : null,
    f.volume ? `Volume : ${f.volume} m³` : null,
    f.message ? `\nPrécisions : ${f.message}` : null,
  ];
  return lines
    .filter((l): l is string => l !== null)
    .join('\n');
}

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState<QuoteForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteForm, string>>>({});
  const whatsapp = settings.whatsapp_phone || settings.site_phone;

  const set = <K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = 'Indiquez votre nom.';
    if (!form.phone.trim() && !form.email.trim()) e.phone = 'Un téléphone ou un e-mail est nécessaire pour vous répondre.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail invalide.';
    if (form.goods.trim().length < 2) e.goods = 'Décrivez la marchandise.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = (channel: 'whatsapp' | 'email') => (ev?: FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    const text = buildMessage(form);
    if (channel === 'whatsapp' && whatsapp) {
      window.open(whatsappLink(whatsapp, text), '_blank', 'noopener');
    } else {
      const subject = `Demande de devis — ${form.name}`;
      window.location.href = `mailto:${settings.site_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }
  };

  const contacts = [
    settings.site_phone && { icon: Phone, label: 'Téléphone', value: settings.site_phone, href: `tel:${settings.site_phone.replace(/\s/g, '')}` },
    whatsapp && { icon: WhatsAppIcon, label: 'WhatsApp', value: 'Discuter maintenant', href: whatsappLink(whatsapp) },
    settings.site_email && { icon: Mail, label: 'E-mail', value: settings.site_email, href: `mailto:${settings.site_email}` },
    settings.support_email && settings.support_email !== settings.site_email && { icon: Mail, label: 'Support suivi', value: settings.support_email, href: `mailto:${settings.support_email}` },
    settings.site_address && { icon: MapPin, label: 'Adresse', value: settings.site_address },
    { icon: Clock, label: 'Horaires', value: settings.opening_hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  const field = (key: keyof QuoteForm) => cn('input', errors[key] && 'input-error');

  return (
    <>
      <SEO />
      <PageHero
        eyebrow="Contact"
        crumbs={['Contact']}
        image="contactDesk"
        imageAlt="Prise de contact"
        imageCaption="Réponse rapide"
        title={
          <>
            Parlons de votre <span className="text-cobalt-500">prochaine expédition.</span>
          </>
        }
        lead="Une question sur un envoi en cours ou un nouveau projet d'import : écrivez-nous, nous répondons rapidement."
      />

      <section className="py-20 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <Reveal className="space-y-3 lg:col-span-4">
            {contacts.map((c) => {
              const inner = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cobalt-50 text-cobalt-500">
                    <c.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{c.label}</span>
                    <span className="block font-semibold [overflow-wrap:anywhere] text-ink">{c.value}</span>
                  </span>
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="card flex items-center gap-4 p-4 transition hover:border-cobalt-300"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="card flex items-center gap-4 p-4">
                  {inner}
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={100} className="lg:col-span-8">
            <form id="devis" onSubmit={send(whatsapp ? 'whatsapp' : 'email')} noValidate className="card scroll-mt-28 p-6 sm:p-10">
              <span className="eyebrow">Demande de devis</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">Décrivez votre envoi</h2>
              <p className="mt-2 text-muted">Le message est préparé pour vous : il ne reste qu'à l'envoyer par WhatsApp ou par e-mail.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="q-name">Nom / entreprise *</label>
                  <input id="q-name" className={field('name')} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="q-phone">Téléphone / WhatsApp</label>
                  <input id="q-phone" type="tel" className={field('phone')} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+237 6XX XX XX XX" autoComplete="tel" />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="q-email">E-mail</label>
                  <input id="q-email" type="email" className={field('email')} value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="q-origin">Ville de départ en Chine</label>
                  <input id="q-origin" className="input" value={form.origin} onChange={(e) => set('origin', e.target.value)} placeholder="Guangzhou, Yiwu, Shenzhen…" />
                </div>
                <div>
                  <label className="label" htmlFor="q-dest">Pays de destination</label>
                  <select id="q-dest" className="input" value={form.destination} onChange={(e) => set('destination', e.target.value)}>
                    {REGIONS.filter((r) => r !== 'Asie').map((r) => (
                      <optgroup key={r} label={r}>
                        {COUNTRIES.filter((c) => c.region === r).map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <span className="label">Mode de transport</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(MODE_LABEL) as QuoteForm['mode'][]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set('mode', m)}
                        className={cn(
                          'h-12 rounded-[10px] border text-sm font-semibold transition',
                          form.mode === m ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-line text-ink hover:border-cobalt-300'
                        )}
                      >
                        {MODE_LABEL[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="q-goods">Marchandise *</label>
                  <input id="q-goods" className={field('goods')} value={form.goods} onChange={(e) => set('goods', e.target.value)} placeholder="Ex. : vêtements, pièces auto, mobilier…" />
                  {errors.goods && <p className="field-error">{errors.goods}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="q-weight">Poids estimé (kg)</label>
                  <input id="q-weight" inputMode="decimal" className="input" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="q-volume">Volume estimé (m³)</label>
                  <input id="q-volume" inputMode="decimal" className="input" value={form.volume} onChange={(e) => set('volume', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="q-msg">Précisions</label>
                  <textarea id="q-msg" rows={4} className="input" value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Date souhaitée, nombre de fournisseurs, livraison à domicile…" />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {whatsapp && (
                  <button type="submit" className="btn btn-primary">
                    <WhatsAppIcon className="size-5" /> Envoyer par WhatsApp
                  </button>
                )}
                <button type={whatsapp ? 'button' : 'submit'} onClick={whatsapp ? () => send('email')() : undefined} className={whatsapp ? 'btn btn-outline' : 'btn btn-primary'}>
                  <Send className="size-4" /> Envoyer par e-mail
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
