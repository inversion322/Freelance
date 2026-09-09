'use client';
import { roasts, coffees, type RoastId } from '@/lib/coffee';

const scale = ['кислотность', 'тело', 'сладость'] as const;
const keys = ['acidity', 'body', 'sweetness'] as const;

export default function Roasts() {
  const go = (id: RoastId) => { window.dispatchEvent(new CustomEvent('zerno:roast', { detail: id })); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <section id="roasts" className="bg-cream-2 px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <h2 className="script display-2">Три обжарки — <br />три характера</h2>
          <p className="mt-6 max-w-[42ch] text-muted md:mt-0">Одно и то же зерно на светлой обжарке даёт цитрус и цветы, на тёмной — шоколад и табак. Обжарка — это не «крепость», а профиль вкуса.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {roasts.map((r) => (
            <article key={r.id} className="card card-hover flex flex-col p-6 md:p-7">
              <div className="flex items-center gap-4">
                <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden><ellipse cx="28" cy="28" rx="15" ry="22" fill={r.bean} transform="rotate(-28 28 28)" /><path d="M28 8c-7 11-7 29 0 40" stroke="#F4E9D3" strokeWidth="3" fill="none" transform="rotate(-28 28 28)" /></svg>
                <div><h3 className="script text-[40px] leading-none">{r.name}</h3><div className="text-[13px] text-muted">{r.lead}</div></div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">{r.forWhat}</p>
              <dl className="mt-6 space-y-2.5">
                {keys.map((k, i) => (
                  <div key={k} className="flex items-center justify-between gap-4 text-[13px]">
                    <dt className="text-muted">{scale[i]}</dt>
                    <dd className="flex gap-1.5" aria-label={`${r.profile[k]} из 5`}>{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2.5 w-2.5 rounded-full ${n <= r.profile[k] ? 'bg-ink' : 'bg-line'}`} />)}</dd>
                  </div>
                ))}
              </dl>
              <div className="hair mt-6 pt-5 text-[13px] text-muted">
                Сорта: {coffees.filter((c) => c.roast === r.id).map((c) => c.name).join(', ')}
              </div>
              <button type="button" className="pill pill-ghost mt-6 self-start" onClick={() => go(r.id)}>Сорта этой обжарки</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
