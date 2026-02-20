import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Painel de Cobertura Farmacêutica</h1>
      <p className="text-sm text-zinc-700">
        Importe sua planilha, veja os gaps por filial e gere sugestões objetivas para o RH tampar os furos.
      </p>
      <div className="flex gap-3">
        <Link className="px-4 py-2 rounded bg-black text-white" href="/import">Importar planilha</Link>
        <Link className="px-4 py-2 rounded border bg-white" href="/rede">Ver rede</Link>
        <Link className="px-4 py-2 rounded border bg-white" href="/rh">Ações RH</Link>
      </div>
      <div className="text-xs text-zinc-500">
        Observação: este MVP foca em leitura automática básica. Linhas confusas ficam marcadas como “Precisa revisão”.
      </div>
    </div>
  );
}
