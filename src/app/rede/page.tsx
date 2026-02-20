import Link from "next/link";
import { prisma } from "@/lib/prisma";

function badge(minutes: number | null) {
  if (minutes === null) return { label: "Revisão", cls: "bg-zinc-200 text-zinc-800" };
  if (minutes >= 180) return { label: "Crítico", cls: "bg-red-600 text-white" };
  if (minutes >= 60) return { label: "Alerta", cls: "bg-yellow-300 text-black" };
  return { label: "OK", cls: "bg-green-600 text-white" };
}

export default async function RedePage() {
  const branches = await prisma.branch.findMany({
    include: { schedules: true },
    orderBy: { code: "asc" },
  });

  // MVP: estimativa simples: se existe schedule com needsReview -> null; senão gap = max(0, 720 - cobertura)
  const rows = branches.map(b => {
    const schedules = b.schedules;
    if (!schedules.length) return { code: b.code, gapMin: 720, review: true };
    if (schedules.some(s => s.needsReview)) return { code: b.code, gapMin: null as any, review: true };
    const covered = schedules.reduce((acc, s) => acc + Math.max(0, (s.endMin - s.startMin)), 0);
    const gap = Math.max(0, 720 - covered); // 12h padrão (até você cadastrar horário real por filial)
    return { code: b.code, gapMin: gap, review: false };
  }).sort((a,b) => (b.gapMin ?? 9999) - (a.gapMin ?? 9999));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Rede</h1>
      <p className="text-sm text-zinc-700">
        Ranking por minutos sem cobertura (estimativa MVP). Itens “Revisão” precisam ajuste de leitura.
      </p>

      <div className="overflow-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="text-left p-3">Filial</th>
              <th className="text-left p-3">Minutos sem cobertura</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const b = badge(r.gapMin === null ? null : r.gapMin);
              return (
                <tr key={r.code} className="border-t">
                  <td className="p-3 font-medium">{r.code}</td>
                  <td className="p-3">{r.gapMin === null ? "—" : r.gapMin}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${b.cls}`}>{b.label}</span>
                  </td>
                  <td className="p-3">
                    <Link className="underline" href={`/filial/${r.code}`}>Ver</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-zinc-500">
        Próxima melhoria: usar o horário real da loja (inclui 24h) e gerar gaps exatos por dia da semana.
      </div>
    </div>
  );
}
