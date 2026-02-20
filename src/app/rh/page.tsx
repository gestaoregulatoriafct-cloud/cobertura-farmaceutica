import { prisma } from "@/lib/prisma";

function suggestion(gapMin: number | null) {
  if (gapMin === null) return { level: "Revisão", action: "Conferir texto de horários e padronizar escala." };
  if (gapMin >= 180) return { level: "Crítico", action: "Ação imediata: realocar/contratar farmacêutico para cobrir os furos." };
  if (gapMin >= 60) return { level: "Alerta", action: "Ajustar escala (banco de horas/turnos) ou contratar parcial." };
  return { level: "OK", action: "Manter monitoramento semanal." };
}

export default async function RHPage() {
  const branches = await prisma.branch.findMany({ include: { schedules: true }, orderBy: { code: "asc" } });

  const rows = branches.map(b => {
    if (!b.schedules.length) return { code: b.code, gapMin: 720 as number | null };
    if (b.schedules.some(s => s.needsReview)) return { code: b.code, gapMin: null as number | null };
    const covered = b.schedules.reduce((acc, s) => acc + Math.max(0, (s.endMin - s.startMin)), 0);
    const gap = Math.max(0, 720 - covered);
    return { code: b.code, gapMin: gap };
  }).sort((a,b) => (b.gapMin ?? 9999) - (a.gapMin ?? 9999));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">RH — Furos a Tampar</h1>
      <p className="text-sm text-zinc-700">
        Lista objetiva para ação. (MVP: cálculo estimado; itens em “Revisão” precisam padronização do texto.)
      </p>

      <div className="grid gap-3">
        {rows.map(r => {
          const s = suggestion(r.gapMin);
          const cls =
            s.level === "Crítico" ? "border-red-300 bg-red-50" :
            s.level === "Alerta" ? "border-yellow-300 bg-yellow-50" :
            s.level === "Revisão" ? "border-zinc-300 bg-zinc-50" :
            "border-green-300 bg-green-50";
          return (
            <div key={r.code} className={`rounded border p-4 ${cls}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.code}</div>
                <div className="text-xs px-2 py-1 rounded bg-white border">{s.level}</div>
              </div>
              <div className="text-sm mt-2">
                Minutos sem cobertura: <b>{r.gapMin === null ? "—" : r.gapMin}</b>
              </div>
              <div className="text-sm text-zinc-700 mt-1">
                <b>Ação:</b> {s.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
