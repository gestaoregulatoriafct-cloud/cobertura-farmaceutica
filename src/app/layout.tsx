import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Cobertura Farmacêutica",
  description: "Painel de gaps e sugestões para RH",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="font-semibold">Cobertura Farmacêutica</div>
            <nav className="flex gap-4 text-sm">
              <Link className="hover:underline" href="/">Início</Link>
              <Link className="hover:underline" href="/import">Importar</Link>
              <Link className="hover:underline" href="/rede">Rede</Link>
              <Link className="hover:underline" href="/rh">RH</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
