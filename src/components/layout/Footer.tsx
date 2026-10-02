import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../ui/Logo';
import WhatsAppIcon from '../ui/WhatsAppIcon';
import { NAV_ITEMS } from '../../data/nav';
import { SERVICES } from '../../data/services';
import { useSiteSettings } from '../../context/settings-context';
import { whatsappLink } from '../../lib/site';
import { normalizeTrackingNumber } from '../../lib/tracking';

export default function Footer() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState('');
  const whatsapp = settings.whatsapp_phone || settings.site_phone;

  const onTrack = (e: FormEvent) => {
    e.preventDefault();
    const n = normalizeTrackingNumber(tracking);
    if (n) navigate(`/track?tracking=${encodeURIComponent(n)}`);
  };

  return (
    <footer className="relative overflow-hidden bg-cobalt-500 text-white" data-print-hide>
      <div className="bg-grid-light pointer-events-none absolute inset-0" />

      <div className="container-x relative pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverted />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-cobalt-100">
              {settings.company_description ||
                "Votre transitaire entre la Chine et l'Afrique : fret maritime et aérien, groupage, dédouanement et suivi de bout en bout."}
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-cobalt-50">
              {settings.site_address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-[18px] shrink-0 text-cobalt-200" /> {settings.site_address}
                </li>
              )}
              {settings.site_phone && (
                <li>
                  <a href={`tel:${settings.site_phone.replace(/\s/g, '')}`} className="flex gap-3 hover:text-white">
                    <Phone className="mt-0.5 size-[18px] shrink-0 text-cobalt-200" /> {settings.site_phone}
                  </a>
                </li>
              )}
              {settings.site_email && (
                <li>
                  <a href={`mailto:${settings.site_email}`} className="flex gap-3 hover:text-white">
                    <Mail className="mt-0.5 size-[18px] shrink-0 text-cobalt-200" /> {settings.site_email}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                    <WhatsAppIcon className="mt-0.5 size-[18px] shrink-0 text-cobalt-200" /> Écrire sur WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.2em] text-cobalt-200 uppercase">Navigation</h4>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-cobalt-50 transition hover:text-white hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.2em] text-cobalt-200 uppercase">Services</h4>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {SERVICES.map((s) => (
                  <li key={s.id}>
                    <Link to={`/services#${s.id}`} className="text-cobalt-50 transition hover:text-white hover:underline">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-mono text-[11px] tracking-[0.2em] text-cobalt-200 uppercase">Suivi express</h4>
              <p className="mt-4 text-sm text-cobalt-100">Entrez votre numéro pour voir où en est votre colis.</p>
              <form onSubmit={onTrack} className="mt-4 flex overflow-hidden rounded-[10px] bg-white p-1">
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="AFC-XXXX-XXXX"
                  aria-label="Numéro de suivi"
                  className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm text-ink uppercase placeholder:text-muted/60 focus:outline-none"
                />
                <button type="submit" className="grid size-10 shrink-0 place-items-center rounded-lg bg-cobalt-500 text-white transition hover:bg-cobalt-600" aria-label="Suivre">
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-14 font-display text-[18vw] leading-[0.8] font-extrabold tracking-tighter text-transparent select-none lg:text-[11.5rem]"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.28)' }}
        >
          AFRICHINA
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-6 text-[13px] text-cobalt-100 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.company_name}. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/terms-and-conditions" className="hover:text-white">Conditions générales</Link>
            <Link to="/track" className="hover:text-white">Suivi de colis</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
