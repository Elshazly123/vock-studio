import Link from "next/link";
import { toWhatsappLink, type SiteSettingsData } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

export default function Footer({ settings, locale }: { settings: SiteSettingsData; locale: Locale }) {
  const s = t(locale);
  return (
    <footer className="border-t border-neutral-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-neutral-500 sm:flex-row">
        <p>© {new Date().getFullYear()} VOCK — {settings.address}</p>
        <div className="flex items-center gap-5">
          <a href={toWhatsappLink(settings.whatsappNumber)} target="_blank" rel="noreferrer" className="hover:text-orange-500" title="WhatsApp">
            <WhatsIcon />
          </a>
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-orange-500" title="Instagram">
              <InstagramIcon />
            </a>
          )}
          {settings.facebookUrl && (
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-orange-500" title="Facebook">
              <FacebookIcon />
            </a>
          )}
          {settings.tiktokUrl && (
            <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="hover:text-orange-500" title="TikTok">
              <TiktokIcon />
            </a>
          )}
          <Link href="/policy" className="hover:text-orange-500">
            {s.footer_privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function WhatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.2c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11a16.9 16.9 0 0 1-5.86-3.7 6.7 6.7 0 0 1-1.4-2.6c-.2-.6-.03-1.2.3-1.6.28-.33.6-.4.8-.4h.5c.16 0 .38-.02.58.44.24.55.8 1.9.87 2.04.07.14.12.3.02.48-.1.18-.15.3-.3.46-.14.16-.3.36-.43.48-.14.14-.3.3-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.3 2.36 1.45.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.24.66-.14.27.1 1.7.8 2 .95.28.14.47.2.54.32.07.13.07.7-.17 1.38z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.6 14.24 3.6c-2.4 0-4.05 1.47-4.05 4.16v2.13H7.5V13H10.19v8h3.31z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.58h-3.1v13.1c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 1 1 0-5.44c.27 0 .53.04.78.11V9.5a5.87 5.87 0 0 0-.78-.05A5.87 5.87 0 1 0 15.2 15.3V9.03a7.35 7.35 0 0 0 4.3 1.38V7.3a4.4 4.4 0 0 1-2.9-1.48z" />
    </svg>
  );
}
