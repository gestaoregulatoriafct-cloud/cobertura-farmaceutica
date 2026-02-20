import { prisma } from "@/lib/prisma";
import { fmt } from "@/lib/gaps";
import Link from "next/link";

export default async function FilialPage({ params }: { params: { code: string } }) {
  const branch = await prisma.branch.findUnique({
    where: { code: params.code },
    include: { schedules: { include: { pharmacist: true } } },
  });

  if (!branch) return <div>Filial não encontrada.</div>;

  const schedules = branch.schedules;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{branch.code}</h1>
        <Link className="underline text-sm" href="/rede">Voltar</Link>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="text-sm text-zinc-700">Farmacêuticos e horários (MVP)</div>
        <div className="mt-3 space-y-2">
          {schedules.length ? schedules.map(s => (
            <div key={s.id} className="flex flex-col gap-1 border rounded p-3">
              <div className="font-medium">{s.pharmacist.name}</div>
              <div className="text-sm">
                Entrada: <b>{fmt(s.startMin)}</b> • Saída: <b>{fmt(s.endMin)}</b>
                {s.needsReview ? <span className="ml-2 text-xs bg-zinc-200 px-2 py-1 rounded">Precisa revisão</span> : null}
              </div>
              {s.sourceText ? <div className="text-xs text-zinc-500">Texto: {s.sourceText}</div> : null}
            </div>
          )) : (
            <div className="text-sm">Nenhuma escala importada.</div>
          )}
        </div>
      </div>

      <div className="rounded border bg-white p-4 text-sm">
        <div className="font-medium">Observação</div>
        <p className="text-zinc-700 mt-1">
          Este MVP ainda usa uma estimativa de funcionamento (12h) para ranking. A próxima melhoria liga o horário real da loja
          (incluindo 24h) e gera gaps exatos por dia/semana.
        </p>
      </div>
    </div>
  );
}
