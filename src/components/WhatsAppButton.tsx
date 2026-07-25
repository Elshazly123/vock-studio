import { toWhatsappLink } from "@/lib/types";

export default function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={toWhatsappLink(whatsappNumber)}
      target="_blank"
      rel="noreferrer"
      title="راسلنا على واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-l from-orange-500 to-red-600 text-white shadow-lg hover:brightness-110"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.2c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11a16.9 16.9 0 0 1-5.86-3.7 6.7 6.7 0 0 1-1.4-2.6c-.2-.6-.03-1.2.3-1.6.28-.33.6-.4.8-.4h.5c.16 0 .38-.02.58.44.24.55.8 1.9.87 2.04.07.14.12.3.02.48-.1.18-.15.3-.3.46-.14.16-.3.36-.43.48-.14.14-.3.3-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.3 2.36 1.45.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.24.66-.14.27.1 1.7.8 2 .95.28.14.47.2.54.32.07.13.07.7-.17 1.38z" />
      </svg>
    </a>
  );
}
