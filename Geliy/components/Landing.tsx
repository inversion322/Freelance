'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Loader from './Loader';
import type { Control } from './Field';
import { brand, nav, themes, dropCards, works, services, steps, faq, marquee, footerCols, fmt, type Theme } from '@/lib/studio';

const Field = dynamic(() => import('./Field'), { ssr: false });

/* иконки в духе lucide, инлайн */
const P = {
  sliders: '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
  chevron: '<polyline points="9 18 15 12 9 6"/>', down: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  pointer: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>', upright: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', sparkles: '<path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
  rotate: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>', send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>', pin: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
};
const Ic = ({ d, className = 'h-4 w-4' }: { d: string; className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden dangerouslySetInnerHTML={{ __html: d }} />;
const Label = ({ children, d }: { children: React.ReactNode; d?: string }) => <div className="rv label" style={{ '--d': d } as React.CSSProperties}>[ {children} ]</div>;

export default function Landing() {
  const control = useRef<Control>({ started: false, progress: 0, ready: false });
  const [started, setStarted] = useState(false);
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const [open, setOpen] = useState(false);
  const onDone = useCallback(() => { control.current.started = true; setStarted(true); }, []);

  /* появление секций один раз */
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
    document.querySelectorAll('.rv').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  return (
    <div className={started ? 'started' : ''}>
      <div id="bg" className="bg" data-stage="0" style={{ '--g1': theme.g1, '--g2': theme.g2 } as React.CSSProperties} />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden><Field key={theme.ball} ballColor={theme.ball} control={control} /></div>
      <Loader control={control} onDone={onDone} />

      <header className="hdr pointer-events-none fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between px-6 md:h-24 md:px-12">
        <a href="#" className="wordmark pointer-events-auto text-lg tracking-[.25em] text-ink md:text-xl">{brand.name}</a>
        <nav className="pointer-events-auto hidden items-center gap-12 text-[14px] font-medium md:flex" aria-label="Разделы">
          {nav.map(([href, label]) => <a key={href} href={href} className="transition-opacity hover:opacity-60" onClick={href === '#palette' ? (e) => { e.preventDefault(); setOpen(true); } : undefined}>{label}</a>)}
        </nav>
        <div className="pointer-events-auto flex items-center gap-2.5 md:gap-3">
          <button type="button" className="glass flex h-10 w-10 items-center justify-center rounded-full md:h-11 md:w-11" aria-label="Палитра события" onClick={() => setOpen(true)}><Ic d={P.sliders} /></button>
          <a href="#services" className="pill py-1.5 pl-5 pr-1.5 md:pl-6">Рассчитать <span className="orb h-8 w-8"><Ic d={P.chevron} /></span></a>
        </div>
      </header>

      <main className="relative z-10">
        {/* 01 герой */}
        <section className="flex min-h-[100svh] items-end px-6 pb-12 md:px-12 md:pb-14">
          <div className="flex w-full flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="flex flex-col items-start gap-3.5">
              <div className="hero-in mb-4 text-xs font-medium uppercase tracking-[.05em] text-blue md:mb-6 md:text-[14px]" style={{ '--d': '.15s' } as React.CSSProperties}>[ Студия аэродизайна · Москва ]</div>
              <h1 className="hero-in h-display text-[2.6rem] leading-[.95] tracking-tighter sm:text-6xl md:text-[clamp(56px,6.2vw,90px)] md:leading-none" style={{ '--d': '.28s' } as React.CSSProperties}>Меньше шума.<br className="md:hidden" /> Больше воздуха.</h1>
            </div>
            <div className="hero-in md:w-[280px]" style={{ '--d': '.45s' } as React.CSSProperties}>
              <p className="text-[15px] font-medium leading-[1.35]">Оформляем праздники шарами так, чтобы в кадре был человек, а не декор.</p>
              <div className="mono mt-5 text-[10px] uppercase tracking-[.18em] text-neutral-500">© 2026 — {brand.full}</div>
              <div className="pulse mt-4 hidden items-center gap-2 text-neutral-500 md:flex"><Ic d={P.down} className="h-3.5 w-3.5" /><span className="mono text-[10px] uppercase tracking-[.2em]">Листайте</span></div>
            </div>
          </div>
        </section>

        {/* 02 шаропад */}
        <section className="flex min-h-[100svh] items-center px-6 pb-40 pt-32 md:px-12 md:pt-40">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
            <div className="lg:col-span-7">
              <Label>02 — Шаропад</Label>
              <h2 className="rv h-display mt-6 text-[2.6rem] leading-[1] sm:text-6xl md:text-[80px] md:leading-[.92]" style={{ '--d': '.1s' } as React.CSSProperties}>Когда потолок<br />отпускает.</h2>
              <p className="rv mt-8 max-w-lg text-[16px] leading-[1.55] text-neutral-700 md:text-[19px]" style={{ '--d': '.2s' } as React.CSSProperties}>В нужную секунду сетка под потолком раскрывается, и триста шаров падают на гостей. Прокрутите: поле на экране сделает то же самое, каждый шар с массой, инерцией и отскоком от пола.</p>
            </div>
            <div className="rv flex flex-col gap-3.5 lg:col-span-5 lg:pt-3" style={{ '--d': '.25s' } as React.CSSProperties}>
              {dropCards.map((c) => (
                <div key={c.n} className="stat"><div>
                  <div className="mono flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-neutral-400"><span>{c.n}</span><span>{c.key}</span><span className="dot ml-auto" /></div>
                  <div className="mt-2 text-[18px] font-semibold text-ink">{c.value}</div>
                  <div className="mt-1 text-[13px] text-neutral-500">{c.text}</div>
                </div></div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 фигуры */}
        <section className="flex min-h-[100svh] flex-col justify-between px-6 py-36 md:px-12 md:py-44">
          <div>
            <Label>03 — Фигуры</Label>
            <h2 className="rv h-display mt-6 max-w-2xl text-[2.6rem] leading-[1] sm:text-6xl md:text-[80px] md:leading-[.92]" style={{ '--d': '.1s' } as React.CSSProperties}>Хаос, потом форма.</h2>
          </div>
          <div className="max-w-sm self-end text-left md:text-right">
            <p className="rv text-[16px] leading-[1.55] text-neutral-700 md:text-[19px]" style={{ '--d': '.15s' } as React.CSSProperties}>Из свободного падения шары собираются в фигуру: сердце, цифру, арку. Проведите курсором и посмотрите, как порядок рассыпается и собирается снова.</p>
            <div className="rv mt-7 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/35 px-4 py-2.5 text-neutral-700 backdrop-blur-md" style={{ '--d': '.28s' } as React.CSSProperties}><Ic d={P.pointer} className="h-3.5 w-3.5" /><span className="mono text-[10px] uppercase tracking-[.2em]">Проведите курсором</span></div>
          </div>
        </section>

        {/* 04 запуск */}
        <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-36 text-center md:px-12 md:py-44">
          <div className="max-w-3xl">
            <Label>04 — Запуск</Label>
            <h2 className="rv h-display mt-7 text-[2.8rem] leading-[1] sm:text-7xl md:text-[88px] md:leading-[.92]" style={{ '--d': '.12s' } as React.CSSProperties}>И потом —<br />невесомость.</h2>
            <p className="rv mx-auto mt-8 max-w-md text-[16px] leading-[1.55] text-neutral-700 md:text-[19px]" style={{ '--d': '.24s' } as React.CSSProperties}>Финал праздника: гелиевые шары уходят в небо, каждый ускоряется мимо камеры, пока не останется только свет. В кадре только лица. Меньше шума.</p>
          </div>
        </section>

        {/* 05 работы */}
        <section id="works" className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Label>05 — Работы</Label>
            <div className="mt-6 md:flex md:items-end md:justify-between">
              <h2 className="rv h-display text-[2.4rem] sm:text-5xl md:text-[64px]" style={{ '--d': '.1s' } as React.CSSProperties}>Что мы оформили<br />этой осенью</h2>
              <p className="rv mt-4 max-w-[40ch] text-[15px] text-neutral-600 md:mt-0" style={{ '--d': '.2s' } as React.CSSProperties}>Шесть последних заказов. В подписи количество шаров и палитра, чтобы было проще сориентироваться в цене.</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((w, i) => (
                <figure key={w.title} className="work rv relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-white/40" style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                  <Image src={w.img} alt={w.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" fetchPriority="low" className="card-img object-cover" />
                  <figcaption className="absolute inset-x-3 bottom-3 rounded-[1rem] bg-white/70 px-4 py-3 backdrop-blur-md">
                    <div className="text-[15px] font-semibold text-ink">{w.title}</div>
                    <div className="mono mt-0.5 text-[10px] uppercase tracking-[.12em] text-neutral-500">{w.meta}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 06 услуги */}
        <section id="services" className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Label>06 — Услуги и цены</Label>
            <h2 className="rv h-display mt-6 text-[2.4rem] sm:text-5xl md:text-[64px]" style={{ '--d': '.1s' } as React.CSSProperties}>Цены до эскиза,<br />а не после</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div key={s.name} className="stat rv" style={{ '--d': `${i * 0.06}s` } as React.CSSProperties}><div>
                  <div className="flex items-baseline justify-between gap-4"><div className="text-[20px] font-semibold text-ink">{s.name}</div><div className="text-[15px] font-semibold text-blue">от {fmt(s.from)}</div></div>
                  <div className="mono mt-0.5 text-[10px] uppercase tracking-[.15em] text-neutral-400">{s.unit}</div>
                  <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{s.text}</p>
                </div></div>
              ))}
            </div>
            <p className="rv mono mt-6 text-[11px] uppercase tracking-[.12em] text-neutral-500">Монтаж по Москве включён в заказы от 25 000 ₽ · демонтаж всегда бесплатно · цены на сентябрь 2026</p>
          </div>
        </section>

        {/* 07 как заказать */}
        <section id="steps" className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Label>07 — Как заказать</Label>
            <h2 className="rv h-display mt-6 text-[2.4rem] sm:text-5xl md:text-[64px]" style={{ '--d': '.1s' } as React.CSSProperties}>Четыре шага<br />до праздника</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.n} className="rv border-t border-ink/15 pt-5" style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                  <div className="mono text-[11px] tracking-[.25em] text-blue">{s.n}</div>
                  <div className="mt-3 text-[22px] font-semibold text-ink">{s.title}</div>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 08 вопросы */}
        <section className="px-6 pb-28 pt-12 md:px-12 md:pb-36">
          <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div><Label>08 — Вопросы</Label><h2 className="rv h-display mt-6 text-[2.4rem] sm:text-5xl md:text-[64px]" style={{ '--d': '.1s' } as React.CSSProperties}>Что спрашивают<br />перед заказом</h2></div>
            <div className="rv" style={{ '--d': '.15s' } as React.CSSProperties}>
              {faq.map((f) => (
                <details key={f.q} className="border-t border-ink/15 py-4 first:border-0">
                  <summary className="flex items-center justify-between gap-4 text-[17px] font-semibold text-ink"><span>{f.q}</span><span className="plus text-[22px] text-neutral-400" aria-hidden>+</span></summary>
                  <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-neutral-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* подвал */}
      <footer id="contact" className="relative z-10 overflow-hidden rounded-t-[2.5rem] bg-neutral-950 text-white md:rounded-t-[4rem]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, #2f69ff66 0%, transparent 65%)' }} />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, #5175ff44 0%, transparent 65%)' }} />
        <div className="overflow-hidden border-b border-white/10 py-5" aria-hidden>
          <div className="marquee font-medium text-white/90" style={{ fontSize: 'clamp(28px, 6vw, 64px)' }}>
            {[0, 1].map((k) => marquee.map((w) => <span key={`${k}${w}`} className="flex items-center px-8">{w}<span className="ml-8 inline-block h-2.5 w-2.5 rounded-full bg-blue-2" /></span>))}
          </div>
        </div>
        <div className="relative px-6 pb-10 pt-16 md:px-12 md:pt-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="rv lg:col-span-5">
              <div className="mono text-[11px] uppercase tracking-[.25em] text-white/40">[ Давайте оформим ]</div>
              <h2 className="mt-5 text-4xl font-medium leading-[.95] md:text-6xl">Есть праздник,<br />которому нужен воздух?</h2>
              <a href={`mailto:${brand.email}`} className="rot45 mt-8 inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/5 py-2 pl-7 pr-2 transition-colors hover:bg-white/10">
                <span className="text-[16px] font-medium md:text-[18px]">{brand.email}</span><span className="orb h-10 w-10"><Ic d={P.upright} /></span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              {footerCols.map((c, i) => (
                <div key={c.title} className="rv" style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                  <div className="mono text-[10px] uppercase tracking-[.25em] text-white/40">{c.title}</div>
                  <ul className="mt-4 space-y-3">{c.links.map((l) => <li key={l}><a href="#" className="link-arrow inline-flex items-center gap-1.5 text-[15px] text-white/75 transition-colors hover:text-white">{l}<Ic d={P.upright} className="h-3.5 w-3.5" /></a></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-7 md:mt-28 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4"><span className="wordmark tracking-[.22em]">{brand.name}</span><span className="h-2.5 w-2.5 rounded-full bg-blue-2" /><span className="mono text-[11px] text-white/40">© 2026 Студия аэродизайна — демонстрационный кейс, компания вымышленная.</span></div>
            <div className="flex gap-3">{[P.send, P.play, P.pin].map((d, i) => <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:text-white" aria-label="Соцсеть"><Ic d={d} /></a>)}</div>
          </div>
        </div>
      </footer>

      {/* шторка палитр */}
      <div className={`scrim fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-sm ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden />
      <aside className={`drawer fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-100 bg-white/95 p-8 backdrop-blur-xl sm:w-[420px] ${open ? 'open' : ''}`} aria-label="Палитра события" aria-hidden={!open}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Ic d={P.sliders} /><span className="wordmark text-[14px] uppercase tracking-[.2em]">Палитра события</span></div>
          <button type="button" className="glass flex h-10 w-10 items-center justify-center rounded-full border-neutral-200 bg-white" aria-label="Закрыть" onClick={() => setOpen(false)}><Ic d={P.x} /></button>
        </div>
        <p className="mono mt-5 text-[12px] italic leading-relaxed text-neutral-400">Выберите цвет шаров в герое. При прокрутке сцена сама уходит в лайм на шаропаде и в розовый, когда собирается сердце.</p>
        <div className="mono mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em]"><Ic d={P.sparkles} className="h-3.5 w-3.5" />Палитры шаров</div>
        <div className="mt-4 flex flex-col gap-3">
          {themes.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === theme.id} onClick={() => { setTheme(t); }} className="theme-card rounded-xl border border-neutral-200 p-4 text-left">
              <div className="flex items-center justify-between"><span className="text-[12px] font-bold">{t.name}</span><span className="h-3 w-3 rounded-full" style={{ background: t.swatch }} /></div>
              <div className="mt-1 text-[10px] opacity-70">{t.text}</div>
            </button>
          ))}
        </div>
        <div className="mono mt-auto space-y-1 pt-8 text-[9px] uppercase tracking-[.15em] text-neutral-400"><div>Шары / латекс + bubble</div><div>Гелий / 12–14 ч полёта</div></div>
        <button type="button" className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 px-4 py-2 text-[12px] font-medium transition-colors hover:bg-neutral-100" onClick={() => setTheme(themes[0])}><Ic d={P.rotate} className="h-3.5 w-3.5" />Сбросить палитру</button>
      </aside>
    </div>
  );
}
