import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseSet, toWhatsappLink } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import BentoGrid from "@/components/BentoGrid";
import Reveal from "@/components/Reveal";

export const revalidate = 30;

export default async function HomePage() {
  const raw = await prisma.set.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sets = raw.map(parseSet);
  const heroFrames = sets.flatMap((s) => s.images).slice(0, 12);
  const settings = await getSettings();
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
              VOCK STUDIOS · مدينة نصر
            </p>
            <h1 className="font-black tracking-tight text-3xl leading-tight text-neutral-50 sm:text-4xl">
              كل سيت، <span className="bg-gradient-to-l from-orange-400 to-red-600 bg-clip-text text-transparent">قصة تصوير تانية.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-300">
              اختار السيت، حدد الباقة، واحجز مكانك أونلاين بديبوزيت بسيط.
            </p>
            <Link href="/sets" className="btn-primary mt-6 inline-flex">
              استكشف السيتات
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: "اختار السيت", b: "تصفح كل السيتات وشوف الديكور اللي يناسب فكرتك." },
              { n: "02", t: "حدد الباقة والميعاد", b: "شوف الأوقات الفاضية أونلاين مباشرة." },
              { n: "03", t: "ادفع الديبوزيت", b: "أكد حجزك بديبوزيت بسيط، وخلاص." },
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
          <h2 className="mb-5 font-black tracking-tight text-2xl text-neutral-50">اختار سيت جلستك</h2>
          <BentoGrid sets={sets} limit={6} />
        </Reveal>
      </section>

      <section className="border-t border-neutral-800 bg-neutral-900/40">
        <Reveal>
          <div className="mx-auto max-w-5xl px-5 py-14">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">عن VOCK</p>
            <h2 className="font-black tracking-tight text-2xl text-neutral-50">Visual Output Creators Kingdom</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">
              استوديو VOCK في مدينة نصر بيقدّم مساحات تصوير جاهزة بديكورات مختلفة — من
              المودرن للفينتاج للمينيمال — مع معدات كاميرا وإضاءة وصوت احترافية وفريق
              مصورين جاهز يشتغل معاك سواء بودكاست، ريلز، أو محتوى تسويقي.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-neutral-800">
        <Reveal>
          <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">تواصل معنا</p>
              <h2 className="font-black tracking-tight text-2xl text-neutral-50">فين مكاننا</h2>
              <p className="mt-3 text-sm text-neutral-400">{settings.address}</p>
              <a href={toWhatsappLink(settings.whatsappNumber)} target="_blank" rel="noreferrer" className="btn-primary mt-5 inline-flex">
                راسلنا على واتساب
              </a>
              <p dir="ltr" className="mt-2 font-mono text-xs text-neutral-500">{settings.whatsappNumber}</p>
            </div>
            <div className="overflow-hidden rounded-sm border border-neutral-800">
              <iframe title="موقع استوديو VOCK" src={mapsSrc} className="h-64 w-full" style={{ border: 0 }} loading="lazy" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
