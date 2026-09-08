'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Plan from './Plan';
import { img } from '@/lib/base';
import { projects, series, fmtM, type Series, type Project } from '@/lib/house';

// у каждого проекта свой кадр и своя точка кадрирования — одинаковые фото в ряду читаются как ошибка
const projectImg: Record<string, { src: string; pos: string }> = {
  's-96':  { src: img('s-sosna.jpg'), pos: '50% 60%' },
  's-124': { src: img('b-3.jpg'),     pos: '50% 70%' },
  's-158': { src: img('s-sosna.jpg'), pos: '30% 45%' },
  'e-142': { src: img('s-el.jpg'),    pos: '50% 55%' },
  'e-176': { src: img('b-1.jpg'),     pos: '50% 60%' },
  'e-214': { src: img('b-4.jpg'),     pos: '50% 60%' },
  'k-188': { src: img('s-kedr.jpg'),  pos: '60% 50%' },
  'k-246': { src: img('hero.jpg'),    pos: '50% 55%' },
  'l-131': { src: img('s-list.jpg'),  pos: '50% 60%' },
  'l-167': { src: img('b-2.jpg'),     pos: '50% 40%' },
  'l-203': { src: img('s-list.jpg'),  pos: '50% 30%' },
  'e-258': { src: img('s-el.jpg'),    pos: '40% 70%' },
};
const areas = [{ id: 'a1', label: 'до 130 м²', t: (p: Project) => p.area <= 130 }, { id: 'a2', label: '130–200 м²', t: (p: Project) => p.area > 130 && p.area <= 200 }, { id: 'a3', label: 'от 200 м²', t: (p: Project) => p.area > 200 }];
const budgets = [{ id: 'b1', label: 'до 9 млн', t: (p: Project) => p.base <= 9e6 }, { id: 'b2', label: '9–14 млн', t: (p: Project) => p.base > 9e6 && p.base <= 14e6 }, { id: 'b3', label: 'от 14 млн', t: (p: Project) => p.base > 14e6 }];

export default function Catalog({ onPick }: { onPick: (id: string) => void }) {
  const [s, setS] = useState<Series | null>(null);
  const [floors, setFloors] = useState<1 | 2 | null>(null);
  const [beds, setBeds] = useState<number | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => projects.filter((p) =>
    (!s || p.series === s) && (!floors || p.floors === floors) && (!beds || p.bedrooms >= beds) &&
    (!area || areas.find((a) => a.id === area)!.t(p)) && (!budget || budgets.find((b) => b.id === budget)!.t(p))
  ), [s, floors, beds, area, budget]);

  const reset = () => { setS(null); setFloors(null); setBeds(null); setArea(null); setBudget(null); };
  const active = [s, floors, beds, area, budget].filter(Boolean).length;

  return (
    <section id="catalog" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 md:flex md:items-end md:justify-between">
          <h2 className="display-2">Двенадцать проектов,<br />четыре <em>серии</em></h2>
          <p className="mt-4 max-w-[44ch] text-muted md:mt-0">Цена — домокомплект с фундаментом. Тёплый контур и «под ключ» считаются в калькуляторе ниже.</p>
        </div>

        {/* фильтры */}
        <div className="mb-8 grid gap-4 border-y border-line py-5 md:grid-cols-[auto_1fr] md:items-start">
          <div className="text-[13px] text-muted md:w-[120px] md:pt-2">Серия</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(series) as Series[]).map((k) => <button key={k} type="button" className="chip" aria-pressed={s === k} onClick={() => setS(s === k ? null : k)}>{k}</button>)}
          </div>
          <div className="text-[13px] text-muted md:pt-2">Этажи</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2].map((f) => <button key={f} type="button" className="chip" aria-pressed={floors === f} onClick={() => setFloors(floors === f ? null : (f as 1 | 2))}>{f}</button>)}
          </div>
          <div className="text-[13px] text-muted md:pt-2">Спален</div>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5].map((b) => <button key={b} type="button" className="chip" aria-pressed={beds === b} onClick={() => setBeds(beds === b ? null : b)}>{b}+</button>)}
          </div>
          <div className="text-[13px] text-muted md:pt-2">Площадь</div>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => <button key={a.id} type="button" className="chip" aria-pressed={area === a.id} onClick={() => setArea(area === a.id ? null : a.id)}>{a.label}</button>)}
          </div>
          <div className="text-[13px] text-muted md:pt-2">Бюджет</div>
          <div className="flex flex-wrap items-center gap-2">
            {budgets.map((b) => <button key={b.id} type="button" className="chip" aria-pressed={budget === b.id} onClick={() => setBudget(budget === b.id ? null : b.id)}>{b.label}</button>)}
            {active > 0 && <button type="button" onClick={reset} className="ml-2 text-[13px] text-muted underline underline-offset-4">Сбросить</button>}
          </div>
        </div>

        <div className="mb-6 text-[14px] text-muted" aria-live="polite">
          {list.length === 0 ? 'Под эти условия проектов нет — снимите один фильтр.' : `Найдено: ${list.length}`}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const isOpen = open === p.id;
            return (
              <article key={p.id} className={`card flex flex-col transition-shadow ${isOpen ? 'shadow-[0_18px_50px_-24px_rgba(28,25,21,.45)] lg:col-span-2' : ''}`}>
                <div className="relative aspect-[4/3]">
                  <Image src={projectImg[p.id].src} alt={`${p.name}, серия ${p.series}`} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" style={{ objectPosition: projectImg[p.id].pos }} />
                  <div className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[12px] font-medium">{p.series} · брус {p.timber} мм</div>
                </div>
                <div className={`grid gap-5 p-5 ${isOpen ? 'md:grid-cols-[1fr_1fr]' : ''}`}>
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-[30px]">{p.name}</h3>
                      <div className="text-right"><div className="text-[12px] text-muted">от</div><div className="font-semibold text-pine">{fmtM(p.base)}</div></div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                      <span>{p.area} м²</span><span>{p.floors === 1 ? '1 этаж' : '2 этажа'}</span><span>{p.bedrooms} спальни</span><span>{p.baths} с/у</span><span>терраса {p.terrace} м²</span>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted">{p.note}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="pill pill-ghost" onClick={() => setOpen(isOpen ? null : p.id)}>{isOpen ? 'Свернуть' : 'Планировка'}</button>
                      <button type="button" className="pill pill-pine" onClick={() => onPick(p.id)}>Рассчитать</button>
                    </div>
                  </div>
                  {isOpen && (
                    <div>
                      <Plan p={p} className="w-full text-ink" />
                      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-muted">
                        {p.plan.map((r) => <li key={r}>{r}{/\d$/.test(r) ? ' м²' : ''}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
