"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay ?? 0}ms` }}
      className={
        "transition-all duration-700 ease-out " +
        (shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
      }
    >
      {children}
    </div>
  );
}
