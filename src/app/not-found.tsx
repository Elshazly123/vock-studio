import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-black tracking-tighter text-3xl text-neutral-50">
        VOCK<span className="text-orange-500">©</span>
      </p>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-orange-500">404</p>
      <h1 className="mt-2 font-black tracking-tight text-2xl text-neutral-50">
        الصفحة دي مش موجودة
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-400">
        يمكن اللينك اتغيّر أو اتكتب غلط. جرب ترجع للصفحة الرئيسية وتدوّر على اللي محتاجه من هناك.
      </p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        العودة للرئيسية
      </Link>
    </section>
  );
}
