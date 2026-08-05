import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const locale = getLocale();
  const s = t(locale);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-black tracking-tighter text-3xl text-neutral-50">
        VOCK<span className="text-orange-500">©</span>
      </p>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-orange-500">404</p>
      <h1 className="mt-2 font-black tracking-tight text-2xl text-neutral-50">{s.not_found_title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-400">{s.not_found_body}</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">{s.back_home}</Link>
    </section>
  );
}
