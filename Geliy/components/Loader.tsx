'use client';
import { useEffect, useState, type MutableRefObject } from 'react';
import type { Control } from './Field';

/** пре-ролл: полоса сама доходит до 92 %, после готовности сцены — до 100 и уходит */
export default function Loader({ control, onDone }: { control: MutableRefObject<Control>; onDone: () => void }) {
  const [v, setV] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf = 0, last = performance.now(), val = 0, fired = false;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now; const ready = control.current.ready;
      if (!ready) val += (92 - val) * 1.7 * dt; else { val += (100 - val) * 6 * dt; if (val >= 99.4) val = 100; }
      setV(val);
      if (val >= 99.9 && ready && !fired) { fired = true; window.setTimeout(() => setLeaving(true), 140); window.setTimeout(() => { onDone(); setGone(true); }, 660); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [control, onDone]);

  if (gone) return null;
  const pct = Math.round(v);
  return (
    <div className={`loader fixed inset-0 z-[100] flex items-center justify-center ${leaving ? 'pointer-events-none opacity-0' : ''}`} style={{ background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #eef2ff 45%, #dbe4ff 100%)' }} aria-live="polite">
      <div className="flex flex-col items-center gap-[26px]">
        <div className="ld mono text-[10px] uppercase tracking-[.28em] text-[#6b7bb5]" style={{ '--d': '0.1s' } as React.CSSProperties}>{pct < 100 ? 'Надуваем шары' : 'Поднимаемся'}</div>
        <div className="ld h-[2px] w-[clamp(180px,32vw,280px)] rounded-full bg-[rgba(14,42,197,.14)]" style={{ '--d': '0.26s' } as React.CSSProperties}><div className="bar h-full rounded-full" style={{ width: `${v}%` }} /></div>
        <div className="ld mono text-[11px] font-bold tabular-nums tracking-[.1em] text-blue" style={{ '--d': '0.42s' } as React.CSSProperties}>{String(pct).padStart(3, '0')}%</div>
      </div>
    </div>
  );
}
