"use client";

import { useState } from "react";
import Image from "next/image";
import { t, type Locale } from "@/lib/i18n";

export default function Gallery({ images, alt, locale }: { images: string[]; alt: string; locale: Locale }) {
  const s = t(locale);
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-neutral-800">
        {images[active] && (
          <Image src={images[active]} alt={alt} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
        )}
      </div>
      {hasMultiple ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={
                "relative aspect-[4/3] overflow-hidden rounded-sm border " +
                (i === active ? "border-orange-500" : "border-neutral-800 opacity-70 hover:opacity-100")
              }
            >
              <Image src={src} alt={alt + " " + s.angle_label + " " + (i + 1)} fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 font-mono text-[10px] text-neutral-600">{s.more_angles_soon}</p>
      )}
    </div>
  );
}
