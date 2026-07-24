import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-black tracking-tighter text-2xl text-neutral-50">
            VOCK<span className="text-orange-500">©</span>
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 sm:inline">
            Visual Output Creators Kingdom
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/sets" className="text-sm text-neutral-300 hover:text-orange-500">
            السيتات
          </Link>
          <Link href="/sets" className="btn-primary">
            احجز دلوقتي
          </Link>
        </nav>
      </div>
    </header>
  );
}
