"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-ink font-body text-neutral-100">
        <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="font-black tracking-tighter text-3xl text-neutral-50">
            VOCK<span className="text-orange-500">©</span>
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-orange-500">حصل خطأ غير متوقع</p>
          <h1 className="mt-2 font-black tracking-tight text-2xl text-neutral-50">
            في مشكلة مؤقتة في الموقع
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            جرب تاني بعد شوية. لو المشكلة استمرت، كلّمنا على واتساب.
          </p>
          <button onClick={() => reset()} className="btn-primary mt-6">
            حاول تاني
          </button>
        </section>
      </body>
    </html>
  );
}
