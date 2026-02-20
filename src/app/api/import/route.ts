import { NextResponse } from "next/server";
import { parseWorkbook } from "@/lib/importer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ message: "Arquivo não enviado" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const rows = parseWorkbook(buffer);

  // Limpa dados antigos (MVP). Em produção, seria versão/rodada.
  await prisma.schedule.deleteMany({});
  await prisma.pharmacist.deleteMany({});
  // branches ficam, mas podem ser reaproveitadas
  // (mantemos para não quebrar códigos já cadastrados)

  let createdSchedules = 0;

  for (const r of rows) {
    const branch = await prisma.branch.upsert({
      where: { code: r.branchCode },
      update: {},
      create: { code: r.branchCode, is24h: /24\s*h|24h/i.test(r.storeHoursText) },
    });

    // cria um "farmacêutico" baseado no texto (MVP). Depois refinamos separação por linhas/itens.
    const pharmacist = await prisma.pharmacist.create({
      data: { name: (r.pharmacistText || "Farmacêutico não identificado").slice(0, 160) },
    });

    // MVP: salva como "padrão semanal" (dayOfWeek=1). Depois aprimoramos para Seg-Dom e 12x36.
    await prisma.schedule.create({
      data: {
        branchId: branch.id,
        pharmacistId: pharmacist.id,
        dayOfWeek: 1,
        startMin: r.startMin ?? 0,
        endMin: r.endMin ?? 0,
        breakStartMin: r.breakStartMin ?? null,
        breakEndMin: r.breakEndMin ?? null,
        sourceText: r.scheduleText,
        needsReview: r.needsReview,
      },
    });
    createdSchedules++;
  }

  return NextResponse.json({
    message: `Importação concluída. Escalas criadas: ${createdSchedules}. Itens confusos foram marcados para revisão.`,
  });
}
