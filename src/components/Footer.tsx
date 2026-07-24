import { STUDIO_ADDRESS, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-neutral-500 sm:flex-row">
        <p>© {new Date().getFullYear()} VOCK — {STUDIO_ADDRESS}</p>
        <div className="flex gap-6">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="hover:text-orange-500">
            واتساب {WHATSAPP_DISPLAY}
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-orange-500">
            انستجرام
          </a>
        </div>
      </div>
    </footer>
  );
}
