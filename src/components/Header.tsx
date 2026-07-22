import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-brand-700">
          Prece<span className="text-brand-500">pto</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/cours/mathematiques/terminale/lyon" className="hover:text-brand-600">
            Trouver un prof
          </Link>
          <Link href="/admin" className="hover:text-brand-600">
            Espace admin
          </Link>
          <Link
            href="/demande"
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Demander un cours
          </Link>
        </nav>
      </div>
    </header>
  );
}
