'use client';
import { useEffect, useMemo, useState } from 'react';
import { coffees, roasts, fmt, kg, type RoastId } from '@/lib/coffee';

type Method = 'filter' | 'espresso';

export default function Catalog() {
  const [roast, setRoast] = useState<RoastId | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [weight, setWeight] = useState<250 | 1000>(250);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const on = (e: Event) => { setRoast((e as CustomEvent<RoastId>).detail); setMethod(null); };
    window.addEventListener('zerno:roast', on); return () => window.removeEventListener('zerno:roast', on);
  }, []);

  const list = useMemo(() => coffees.filter((c) => (!roast || c.roast === roast) && (!method || c.method.includes(method))), [roast, method]);

  return (
    <section id="catalog" className="px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 md:flex md:items-end md:justify-between">
          <h2 className="script display-2">Восемь сортов <br />этого сезона</h2>
          <p className="mt-6 max-w-[44ch] text-muted md:mt-0">Цена за 250 г зерна. Помол под ваш способ — бесплатно, отметьте при заказе. Килограмм выгоднее на 15 %.</p>
        </div>

        <div className="mb-8 grid gap-4 border-y border-line py-5 md:grid-cols-[110px_1fr] md:items-start">
          <div className="text-[13px] text-muted md:pt-2">Обжарка</div>
          <div className="flex flex-wrap gap-2">{roasts.map((r) => <button key={r.id} type="button" className="chip" aria-pressed={roast === r.id} onClick={() => setRoast(roast === r.id ? null : r.id)}>{r.name}</button>)}</div>
          <div className="text-[13px] text-muted md:pt-2">Способ</div>
          <div className="flex flex-wrap gap-2">
            {([['filter', 'Фильтр и воронка'], ['espresso', 'Эспрессо']] as const).map(([id, label]) => <button key={id} type="button" className="chip" aria-pressed={method === id} onClick={() => setMethod(method === id ? null : id)}>{label}</button>)}
          </div>
          <div className="text-[13px] text-muted md:pt-2">Вес</div>
          <div className="flex flex-wrap items-center gap-2">
            {([250, 1000] as const).map((w) => <button key={w} type="button" className="chip" aria-pressed={weight === w} onClick={() => setWeight(w)}>{w === 250 ? '250 г' : '1 кг'}</button>)}
            {(roast || method) && <button type="button" onClick={() => { setRoast(null); setMethod(null); }} className="press ml-2 text-[13px] text-muted underline underline-offset-4 hover:text-ink">Сбросить</button>}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between text-[14px] text-muted" aria-live="polite">
          <span>{list.length === 0 ? 'Под эти условия сортов нет — снимите один фильтр.' : `Найдено: ${list.length}`}</span>
          <span>В корзине: {cart.length}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c) => {
            const r = roasts.find((x) => x.id === c.roast)!; const inCart = cart.includes(c.id);
            return (
              <article key={c.id} className="card card-hover flex flex-col p-5">
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span>{c.origin} · {c.process}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.bean }} />{r.name.toLowerCase()}</span>
                </div>
                <h3 className="script mt-3 text-[38px] leading-none">{c.name}</h3>
                <div className="mt-1 text-[13px] text-muted">{c.region} · {c.altitude} · {c.variety}</div>
                <div className="mt-4 flex flex-wrap gap-1.5">{c.notes.map((n) => <span key={n} className="rounded-full bg-cream px-2.5 py-1 text-[12px] font-medium">{n}</span>)}</div>
                <p className="mt-4 text-[14px] leading-relaxed text-muted">{c.note}</p>
                <div className="hair mt-auto flex items-end justify-between pt-4">
                  <div><div className="text-[12px] text-muted">SCA {c.sca}</div><div className="text-[20px] font-semibold">{fmt(weight === 250 ? c.price : kg(c.price))}</div></div>
                  <button type="button" className={`pill ${inCart ? 'pill-ghost' : 'pill-ink'} px-4 py-3`} aria-pressed={inCart} onClick={() => setCart((k) => (inCart ? k.filter((x) => x !== c.id) : [...k, c.id]))}>{inCart ? 'Добавлено ✓' : 'В корзину'}</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
