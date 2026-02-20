export type Interval = { start: number; end: number }; // minutes within day

export function normalizeIntervals(intervals: Interval[]): Interval[] {
  const clean = intervals
    .map(i => ({
      start: Math.max(0, Math.min(1440, i.start)),
      end: Math.max(0, Math.min(1440, i.end)),
    }))
    .filter(i => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  const merged: Interval[] = [];
  for (const cur of clean) {
    const last = merged[merged.length - 1];
    if (!last || cur.start > last.end) merged.push({ ...cur });
    else last.end = Math.max(last.end, cur.end);
  }
  return merged;
}

export function subtractIntervals(outer: Interval, covered: Interval[]): Interval[] {
  const gaps: Interval[] = [];
  let cursor = outer.start;
  for (const c of covered) {
    if (c.end <= outer.start || c.start >= outer.end) continue;
    const start = Math.max(c.start, outer.start);
    const end = Math.min(c.end, outer.end);
    if (start > cursor) gaps.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  }
  if (cursor < outer.end) gaps.push({ start: cursor, end: outer.end });
  return gaps.filter(g => g.end > g.start);
}

export function minutes(intervals: Interval[]): number {
  return intervals.reduce((acc, i) => acc + (i.end - i.start), 0);
}

export function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
