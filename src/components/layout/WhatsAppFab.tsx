import WhatsAppIcon from '../ui/WhatsAppIcon';
import { useSiteSettings } from '../../context/settings-context';
import { whatsappLink } from '../../lib/site';

export default function WhatsAppFab() {
  const { settings } = useSiteSettings();
  const phone = settings.whatsapp_phone || settings.site_phone;
  if (!phone) return null;

  return (
    <a
      href={whatsappLink(phone, `Bonjour ${settings.company_name}, j'ai une question concernant une expédition.`)}
      target="_blank"
      rel="noreferrer"
      data-print-hide
      aria-label="Nous écrire sur WhatsApp"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-cobalt-500 py-3 pr-3 pl-3 text-white shadow-[0_14px_34px_-12px_rgba(23,71,230,0.8)] transition-all hover:bg-cobalt-600 sm:right-6 sm:bottom-6 sm:pr-5"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
    </a>
  );
}
