import type { Project } from '@/lib/house';

/**
 * Схематичная планировка из данных проекта: прямоугольник дома по площади,
 * комнаты — пропорциональные блоки по списку `plan`. Не чертёж, а честная схема.
 */
export default function Plan({ p, className = '' }: { p: Project; className?: string }) {
  const rooms = p.plan.map((s) => {
    const m = s.match(/^(.*?)\s(\d+)$/);
    return m ? { name: m[1], area: +m[2] } : { name: s, area: 12 };
  });
  const total = rooms.reduce((a, r) => a + r.area, 0) || 1;
  const W = 300, H = 200, pad = 10;
  // раскладка «полосами»: две строки, ширина блока пропорциональна площади
  const row1: typeof rooms = [], row2: typeof rooms = [];
  let acc = 0;
  for (const r of rooms) { (acc < total / 2 ? row1 : row2).push(r); acc += r.area; }
  const rowH = (H - pad * 2) / (row2.length ? 2 : 1);
  const layout = (row: typeof rooms, y: number) => {
    const sum = row.reduce((a, r) => a + r.area, 0) || 1;
    let x = pad;
    return row.map((r) => { const w = ((W - pad * 2) * r.area) / sum; const box = { ...r, x, y, w, h: rowH }; x += w; return box; });
  };
  const boxes = [...layout(row1, pad), ...(row2.length ? layout(row2, pad + rowH) : [])];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Схема планировки: ${p.plan.join(', ')}`}>
      <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="none" stroke="currentColor" strokeWidth="2" />
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
          {b.w > 46 && (
            <>
              <text x={b.x + 6} y={b.y + 16} fontSize="9" fill="currentColor" opacity=".8">{b.name.length > Math.floor(b.w / 5.2) ? b.name.slice(0, Math.floor(b.w / 5.2) - 1) + '…' : b.name}</text>
              <text x={b.x + 6} y={b.y + b.h - 8} fontSize="10" fontWeight="600" fill="currentColor">{b.area} м²</text>
            </>
          )}
        </g>
      ))}
      {/* терраса */}
      <rect x={pad} y={H - pad + 2} width={(W - pad * 2) * Math.min(1, p.terrace / p.area)} height={4} fill="currentColor" opacity=".35" />
    </svg>
  );
}
