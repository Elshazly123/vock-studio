import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseSet, toWhatsappLink } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import BentoGrid from "@/components/BentoGrid";
import Reveal from "@/components/Reveal";
import InstagramFeed from "@/components/InstagramFeed";

export const revalidate = 30;

export default async function HomePage() {
  const raw = await prisma.set.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sets = raw.map(parseSet);
  const heroFrames = sets.flatMap((s) => s.images).slice(0, 12);
  const settings = await getSettings();
  const locale = getLocale();
  const s = t(locale);
  const mapsSrc = "https://maps.google.com/maps?q=" + encodeURIComponent(settings.address) + "&output=embed";

  return (
    <>
      <section className="relative overflow-hidden border-b border-neutral-800">
        <div className="grid grid-cols-3 gap-[2px] bg-neutral-800 sm:grid-cols-4 lg:grid-cols-6">
          {heroFrames.map((src, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
              <Image src={src} alt="" fill sizes="20vw" className="object-cover" priority={i < 6} />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center bg-neutral-950/80"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 20%, rgba(242,144,15,0.25), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(232,72,28,0.22), transparent 55%)",
          }}
        >
          <div className="mx-auto max-w-xl px-6 text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-orange-500">
              {s.hero_eyebrow}
            </p>
            <h1 className="font-black tracking-tight text-3xl leading-tight text-neutral-50 sm:text-4xl">
              {s.hero_title_1} <span className="bg-gradient-to-l from-orange-400 to-red-600 bg-clip-text text-transparent">{s.hero_title_2}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-300">
              {s.hero_sub}
            </p>
            <Link href="/sets" className="btn-primary mt-6 inline-flex">
              {s.hero_cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: s.step1_t, b: s.step1_b },
              { n: "02", t: s.step2_t, b: s.step2_b },
              { n: "03", t: s.step3_t, b: s.step3_b },
            ].map((step) => (
              <div key={step.n}>
                <span className="font-black text-2xl text-orange-500">{step.n}</span>
                <h3 className="mt-2 font-semibold text-neutral-50">{step.t}</h3>
                <p className="mt-1 text-sm text-neutral-400">{step.b}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-14">
        <Reveal>
          <h2 className="mb-5 font-black tracking-tight text-2xl text-neutral-50">{s.pick_your_set}</h2>
          <BentoGrid sets={sets} limit={6} locale={locale} />
        </Reveal>
      </section>

      <section className="border-t border-neutral-800 bg-neutral-900/40">
        <Reveal>
          <div className="mx-auto max-w-5xl px-5 py-14">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.about_eyebrow}</p>
            <h2 className="font-black tracking-tight text-2xl text-neutral-50">{s.about_title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">{s.about_body}</p>
          </div>
        </Reveal>
      </section>

      <InstagramFeed posts={settings.instagramPosts} locale={locale} />

      <section className="border-t border-neutral-800">
        <Reveal>
          <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.contact_eyebrow}</p>
              <h2 className="font-black tracking-tight text-2xl text-neutral-50">{s.contact_title}</h2>
              <p className="mt-3 text-sm text-neutral-400">{settings.address}</p>
              <a href={toWhatsappLink(settings.whatsappNumber)} target="_blank" rel="noreferrer" className="btn-primary mt-5 inline-flex">
                {s.contact_whatsapp}
              </a>
              <p dir="ltr" className="mt-2 font-mono text-xs text-neutral-500">{settings.whatsappNumber}</p>
            </div>
            <div className="overflow-hidden rounded-sm border border-neutral-800">
              <iframe title="VOCK Studio location" src={mapsSrc} className="h-64 w-full" style={{ border: 0 }} loading="lazy" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
