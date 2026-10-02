import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import WhatsAppIcon from '../../components/ui/WhatsAppIcon';
import { useSiteSettings } from '../../context/settings-context';
import { countryName } from '../../lib/countries';
import { phoneDigits, trackingUrl } from '../../lib/site';

export interface WhatsAppTarget {
  tracking_number: string;
  receiver_name: string;
  receiver_phone: string;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
}

function fillTemplate(template: string, t: WhatsAppTarget, company: string) {
  const vars: Record<string, string> = {
    nom: t.receiver_name || '',
    numero: t.tracking_number,
    origine: t.origin || countryName(t.origin_country),
    destination: t.destination || countryName(t.destination_country),
    societe: company,
    lien: trackingUrl(t.tracking_number),
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m).replace(/\s+,/g, ',').replace(/ {2,}/g, ' ');
}

/** Sépare l'indicatif du numéro local si le numéro enregistré le contient déjà. */
function splitPhone(raw: string, defaultCode: string) {
  const digits = phoneDigits(raw);
  if (digits.startsWith(defaultCode) && digits.length > defaultCode.length + 6) {
    return { code: defaultCode, local: digits.slice(defaultCode.length) };
  }
  return { code: defaultCode, local: digits };
}

export default function WhatsAppModal({ target, onClose }: { target: WhatsAppTarget; onClose: () => void }) {
  const { settings } = useSiteSettings();
  const initial = splitPhone(target.receiver_phone, settings.whatsapp_country_code || '237');
  const [code, setCode] = useState(initial.code);
  const [local, setLocal] = useState(initial.local);
  const [message, setMessage] = useState(() => fillTemplate(settings.whatsapp_template, target, settings.company_name));
  const [error, setError] = useState('');

  const send = () => {
    const cc = phoneDigits(code);
    const num = phoneDigits(local).replace(/^0+/, '');
    if (!cc) return setError("Indiquez l'indicatif du pays.");
    if (num.length < 6 || num.length > 12) return setError('Numéro invalide (6 à 12 chiffres, sans indicatif).');
    window.open(`https://wa.me/${cc}${num}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Envoyer par WhatsApp" className="max-w-lg">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-cobalt-50 p-3.5">
          <WhatsAppIcon className="size-5 text-cobalt-500" />
          <div className="text-sm">
            <p className="font-semibold text-ink">{target.receiver_name || 'Destinataire'}</p>
            <p className="font-mono text-xs text-muted">{target.tracking_number}</p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="wa-phone">Numéro WhatsApp</label>
          <div className="flex gap-2">
            <div className="relative w-24 shrink-0">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">+</span>
              <input
                className="input pl-6 font-mono"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                aria-label="Indicatif pays"
              />
            </div>
            <input
              id="wa-phone"
              className="input font-mono"
              inputMode="numeric"
              value={local}
              onChange={(e) => {
                setLocal(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              placeholder="6XX XX XX XX"
              autoFocus
            />
          </div>
          {error ? <p className="field-error">{error}</p> : <p className="field-hint">Prérempli avec le téléphone du destinataire.</p>}
        </div>

        <div>
          <label className="label" htmlFor="wa-msg">Message</label>
          <textarea id="wa-msg" rows={6} className="input resize-none" value={message} onChange={(e) => setMessage(e.target.value)} />
          <p className="field-hint">Modèle réglable dans Paramètres → Message WhatsApp.</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1">
            Annuler
          </button>
          <button type="button" onClick={send} className="btn btn-primary flex-1">
            <WhatsAppIcon className="size-5" /> Ouvrir WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
