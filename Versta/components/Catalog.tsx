'use client';
import { useMemo, useState, useRef, useLayoutEffect, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Plan from './Plan';
import { projects, series, fmtM, type Series, type Project } from '@/lib/house';

gsap.registerPlugin(Flip, ScrollTrigger);

const areas = [{ id: 'a1', label: 'до 130 м²', t: (p: Project) => p.area <= 130 }, { id: 'a2', label: '130–200 м²', t: (p: Project) => p.area > 130 && p.area <= 200 }, { id: 'a3', label: 'от 200 м²', t: (p: Project) => p.area > 200 }];
const budgets = [{ id: 'b1', label: 'до 9 млн', t: (p: Project) => p.base <= 9e6 }, { id: 'b2', label: '9–14 млн', t: (p: Project) => p.base > 9e6 && p.base <= 14e6 }, { id: 'b3', label: 'от 14 млн', t: (p: Project) => p.base > 14e6 }];

export default function Catalog({ onPick }: { onPick: (id: string) => void }) {
  const [s, setS] = useState<Series | null>(null);
  const [floors, setFloors] = useState<1 | 2 | null>(null);
  const [beds, setBeds] = useState<number | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const reduce = useRef(false);

  useEffect(() => { reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);

  const visible = useMemo(() => new Set(projects.filter((p) =>
    (!s || p.series === s) && (!floors || p.floors === floors) && (!beds || p.bedrooms >= beds) &&
    (!area || areas.find((a) => a.id === area)!.t(p)) && (!budget || budgets.find((b) => b.id === budget)!.t(p))
  ).map((p) => p.id)), [s, floors, beds, area, budget]);

  // снимок раскладки до изменения фильтра — Flip доиграет разницу
  function capture() { if (grid.current && !reduce.current) flipState.current = Flip.getState(grid.current.querySelectorAll('.pcard')); }
  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      duration: 0.3, ease: 'power2.inOut', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.2, ease: 'power2.out' }),
    });
    flipState.current = null;
  }, [visible, open]);

  // появление один раз при первом показе, стаггер 70 мс
  useEffect(() => {
    if (!grid.current || reduce.current) return;
    const cards = grid.current.querySelectorAll('.pcard');
    const tw = gsap.from(cards, { opacity: 0, y: 18, duration: 0.5, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: grid.current, start: 'top 85%', toggleActions: 'play none none none' } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, []);

  const set = <T,>(fn: (v: T) => void) => (v: T) => { capture(); fn(v); };
  const reset = () => { capture(); setS(null); setFloors(null); setBeds(null); setArea(null); setBudget(null); };
  const active = [s, floors, beds, area, budget].filter(Boolean).length;
  const count = visible.size;

  return (
    <section id="catalog" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 md:flex md:items-end md:justify-between">
          <h2 className="display-2">Двенадцать проектов,<br />четыре <em>серии</em></h2>
          <p className="mt-4 max-w-[44ch] text-muted md:mt-0">Цена — домокомплект с фундаментом. На фото — построенный дом этого проекта или его серии, планировка раскрывается по кнопке «Помещения».</p>
        </div>

        <div className="mb-8 grid gap-4 border-y border-line py-5 md:grid-cols-[120px_1fr] md:items-start">
          <div className="text-[13px] text-muted md:pt-2">Серия</div>
          <div className="flex flex-wrap gap-2">{(Object.keys(series) as Series[]).map((k) => <button key={k} type="button" className="chip" aria-pressed={s === k} onClick={set(() => setS(s === k ? null : k))}>{k}</button>)}</div>
          <div className="text-[13px] text-muted md:pt-2">Этажи</div>
          <div className="flex flex-wrap gap-2">{[1, 2].map((f) => <button key={f} type="button" className="chip" aria-pressed={floors === f} onClick={set(() => setFloors(floors === f ? null : (f as 1 | 2)))}>{f}</button>)}</div>
          <div className="text-[13px] text-muted md:pt-2">Спален</div>
          <div className="flex flex-wrap gap-2">{[2, 3, 4, 5].map((b) => <button key={b} type="button" className="chip" aria-pressed={beds === b} onClick={set(() => setBeds(beds === b ? null : b))}>{b}+</button>)}</div>
          <div className="text-[13px] text-muted md:pt-2">Площадь</div>
          <div className="flex flex-wrap gap-2">{areas.map((a) => <button key={a.id} type="button" className="chip" aria-pressed={area === a.id} onClick={set(() => setArea(area === a.id ? null : a.id))}>{a.label}</button>)}</div>
          <div className="text-[13px] text-muted md:pt-2">Бюджет</div>
          <div className="flex flex-wrap items-center gap-2">
            {budgets.map((b) => <button key={b.id} type="button" className="chip" aria-pressed={budget === b.id} onClick={set(() => setBudget(budget === b.id ? null : b.id))}>{b.label}</button>)}
            {active > 0 && <button type="button" onClick={reset} className="press ml-2 text-[13px] text-muted underline underline-offset-4 hover:text-ink">Сбросить</button>}
          </div>
        </div>

        <div className="mb-6 text-[14px] text-muted" aria-live="polite">
          {count === 0 ? 'Под эти условия проектов нет — снимите один фильтр.' : `Найдено: ${count}`}
        </div>

        <div ref={grid} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            if (!visible.has(p.id)) return null;
            const isOpen = open === p.id;
            return (
              <article key={p.id} data-flip-id={p.id} className={`pcard card-hover card flex flex-col ${isOpen ? 'lg:col-span-2' : ''}`}>
                {/* фото проекта — главный визуал; планировка раскрывается по «Помещения» */}
                <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                  <Image src={p.img} alt={`${p.name}: ${p.floors === 1 ? 'одноэтажный' : 'двухэтажный'} дом ${p.area} м²`} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" fetchPriority="low" className="card-img object-cover" />
                  <div className="absolute left-4 top-4 rounded-full bg-paper-2/95 px-3 py-1 text-[12px] font-medium">{p.series} · {p.timber} мм</div>
                  <div className="absolute bottom-4 right-4 rounded-full bg-ink/80 px-3 py-1 text-[12px] font-medium text-white">{p.floors === 1 ? '1 этаж' : '2 этажа'} · {p.area} м²</div>
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
                      <button type="button" className="pill pill-ghost" onClick={() => { capture(); setOpen(isOpen ? null : p.id); }}>{isOpen ? 'Свернуть' : 'Помещения'}</button>
                      <button type="button" className="pill pill-pine" onClick={() => onPick(p.id)}>Рассчитать</button>
                    </div>
                  </div>
                  {isOpen && (
                    <div>
                      <div className="mb-3 rounded-[14px] bg-paper p-4"><Plan p={p} className="plan-draw w-full text-ink" /></div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-muted">
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
