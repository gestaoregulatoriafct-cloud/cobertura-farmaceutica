import * as XLSX from "xlsx";

function toMin(t: string): number | null {
  const s = t.toLowerCase().replace("h", ":").trim();
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 24 || mm < 0 || mm > 59) return null;
  return Math.min(1440, hh * 60 + mm);
}

export type ParsedRow = {
  branchCode: string;
  storeHoursText: string;
  pharmacistText: string;
  scheduleText: string;
  startMin?: number;
  endMin?: number;
  breakStartMin?: number;
  breakEndMin?: number;
  needsReview: boolean;
};

export function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

  const keys = Object.keys(json[0] || {});
  // best-effort column matching
  const colFilial = keys.find(k => k.toLowerCase().includes("filial")) ?? keys[0];
  const colStore = keys.find(k => k.toLowerCase().includes("hor") && k.toLowerCase().includes("loja")) 
                ?? keys.find(k => k.toLowerCase().includes("funcionamento")) 
                ?? colFilial;
  const colFarm = keys.find(k => k.toLowerCase().includes("farmac") && k.toLowerCase().includes("texto"))
              ?? keys.find(k => k.toLowerCase().includes("farmac"))
              ?? keys[Math.min(1, keys.length - 1)];
  const colHorario = keys.find(k => k.toLowerCase().includes("hor") && k.toLowerCase().includes("farm"))
                 ?? keys.find(k => k.toLowerCase().includes("hor"))
                 ?? keys[Math.min(2, keys.length - 1)];

  return json.map((r) => {
    const filialRaw = String(r[colFilial] ?? "").trim();
    const match = filialRaw.match(/(\d{1,3})/);
    const n = match ? Number(match[1]) : null;
    const branchCode = n === null ? "NÃO_IDENT" : (n < 100 ? `F${String(n).padStart(2, "0")}` : `F${n}`);

    const storeHoursText = String(r[colStore] ?? "").trim();
    const pharmacistText = String(r[colFarm] ?? "").trim();
    const scheduleText = String(r[colHorario] ?? "").trim();

    const times = Array.from(scheduleText.matchAll(/(\d{1,2}[:h]\d{2})/gi)).map(m => m[1]);
    const mins = times.map(t => toMin(t)).filter((x): x is number => x !== null);

    let needsReview = false;
    let startMin: number | undefined;
    let endMin: number | undefined;

    if (mins.length >= 2) {
      startMin = Math.min(...mins);
      endMin = Math.max(...mins);
      if ((endMin - startMin) < 120) needsReview = true;
    } else {
      needsReview = true;
    }

    return { branchCode, storeHoursText, pharmacistText, scheduleText, startMin, endMin, needsReview };
  });
}
