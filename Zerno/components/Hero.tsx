'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { brand, roasts, fmt, type RoastId } from '@/lib/coffee';
import type { SceneApi, Shared } from './BeanScene';
import Bag from './Bag';

const BeanScene = dynamic(() => import('./BeanScene'), { ssr: false });

const nav = [['#', 'Главная'], ['#roasts', 'Обжарки'], ['#catalog', 'Сорта'], ['#cafe', 'Кофейня'], ['#subscribe', 'Подписка']] as const;

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const glWrap = useRef<HTMLDivElement>(null);
  const steam = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ x: 0, y: 0, px: -1, py: -1, cx: 0, cy: 0, spin: 0, reduce: false, mobile: false });
  const api = useRef<SceneApi | null>(null);
  const [roast, setRoast] = useState<RoastId>('medium');
  const [ready, setReady] = useState(false);
  const busy = useRef(false);
  const R = roasts.find((r) => r.id === roast)!;

  useEffect(() => {
    const s = shared.current;
    s.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; s.mobile = window.innerWidth < 768;
    setReady(true);
    const onMove = (e: PointerEvent) => { s.x = e.clientX / window.innerWidth - 0.5; s.y = e.clientY / window.innerHeight - 0.5; s.px = e.clientX; s.py = e.clientY; };
    const onLeave = () => { s.px = -1; s.py = -1; };
    window.addEventListener('pointermove', onMove); document.addEventListener('pointerleave', onLeave);
    return () => { window.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); };
  }, []);

  /* пар: одно пятно каждые 420 мс, не больше 24 живых */
  useEffect(() => {
    if (shared.current.reduce) return;
    const box = steam.current; if (!box) return;
    const id = window.setInterval(() => {
      if (document.hidden || box.childElementCount > 24) return;
      const w = document.createElement('span'); w.className = 'wisp';
      const size = 40 + Math.random() * 70; const dur = 7 + Math.random() * 5;
      w.style.cssText = `left:${30 + Math.random() * 40}%;width:${size}px;height:${size}px;--dx:${(Math.random() - 0.5) * 120}px;animation-duration:${dur}s`;
      box.appendChild(w); window.setTimeout(() => w.remove(), dur * 1000);
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  /* смена обжарки: фон, оборот зерна с размытием, спутники — через сцену */
  const pick = useCallback((id: RoastId) => {
    if (busy.current || id === roast) return;
    busy.current = true; setRoast(id);
    const N = roasts.find((r) => r.id === id)!; const el = section.current!; const s = shared.current;
    gsap.to(el, { '--bg-inner': N.bg[0], '--bg-mid': N.bg[1], '--bg-outer': N.bg[2], duration: s.reduce ? 0.6 : 1.5, ease: 'power2.inOut' });
    if (!s.reduce) {
      const o = { val: 0, blur: 0 }; const wrap = glWrap.current!;
      const upd = () => { s.spin = o.val; wrap.style.filter = o.blur > 0.3 ? `blur(${o.blur}px)` : 'none'; };
      gsap.to(o, { val: 360, blur: s.mobile ? 0 : 14, duration: 0.6, ease: 'power2.in', onUpdate: upd, onComplete: () =>
        gsap.to(o, { val: 720, blur: 0, duration: 1.5, ease: 'back.out(0.7)', onUpdate: upd, onComplete: () => { s.spin = 0; wrap.style.filter = 'none'; } }) });
    }
    const done = () => { busy.current = false; };
    if (api.current) api.current.switchRoast(id).then(done); else done();
  }, [roast]);

  const idx = roasts.findIndex((r) => r.id === roast);
  const step = (d: number) => pick(roasts[(idx + d + roasts.length) % roasts.length].id);

  return (
    <section ref={section} className="hero-bg relative min-h-[100svh] overflow-hidden text-white">
      <div ref={steam} className="pointer-events-none absolute inset-0 z-0" aria-hidden />

      <header className="relative z-30 flex items-center justify-between px-5 py-6 md:px-[4%]">
        <a href="#" className="flex items-center gap-2 text-[26px] script">
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden><ellipse cx="15" cy="15" rx="8" ry="12" fill="currentColor" transform="rotate(-28 15 15)" /><path d="M15 4c-4 6-4 16 0 22" stroke="var(--bg-mid)" strokeWidth="2.2" fill="none" transform="rotate(-28 15 15)" /></svg>
          {brand.name}
        </a>
        <nav className="glass hidden items-center gap-1 rounded-full p-1.5 lg:flex" aria-label="Разделы">
          {nav.map(([href, label], i) => <a key={href} href={href} className="nav-item" aria-current={i === 0 ? 'page' : undefined}>{label}</a>)}
        </nav>
        <a href="#catalog" className="pill pill-dark">Заказать</a>
      </header>

      <div className="relative z-10 grid min-h-[calc(100svh-92px)] grid-rows-[auto_1fr_auto] px-5 pb-8 md:px-[4%] lg:grid-cols-[1fr_auto] lg:grid-rows-1 lg:items-stretch lg:pb-12">
        {/* левая колонка */}
        <div className="relative z-20 flex min-w-0 flex-col gap-7 py-4 lg:py-14">
          <h1 className="script display enter">Свежая<br />обжарка</h1>
          <p className="enter enter-2 max-w-[40ch] text-[17px] leading-relaxed text-white/75">
            Обжариваем в Москве по вторникам и четвергам и отправляем не позже 48 часов после обжарки. Восемь сортов, три обжарки — выберите свою.
          </p>
          <div className="enter enter-3 flex flex-wrap gap-3">
            <a href="#catalog" className="pill pill-dark py-2.5 pr-3">Выбрать сорт <span className="plus" aria-hidden>+</span></a>
            <a href="#roasts" className="pill pill-glass">Как выбрать обжарку</a>
          </div>
          <div className="enter enter-4 mt-auto flex items-center gap-4">
            <div className="glass flex h-12 w-12 items-center justify-center rounded-[14px]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M5 9h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9z" /><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8 5v2M11 4v3" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] tracking-[.12em] text-white/60">ОТКРЫТЫЙ КАППИНГ</span>
              <span className="text-[14px] font-semibold">каждую субботу в 12:00, бесплатно</span>
            </div>
          </div>
        </div>

        {/* зерно: один канвас — на десктопе поверх всей секции (клики проходят сквозь), на телефоне блок между текстом и карточками */}
        <div ref={glWrap} className="pointer-events-none relative z-10 h-[52svh] lg:absolute lg:inset-0 lg:h-auto" aria-hidden>
          {ready && <BeanScene shared={shared} api={api} roast={roast} />}
        </div>

        {/* рукописная пометка со стрелкой — приём palmo */}
        <div className="pointer-events-none absolute bottom-[30%] left-[36%] z-20 hidden lg:block" aria-live="polite">
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="mb-1 ml-8 text-white/80" aria-hidden><path d="M78 6 C 60 10, 30 24, 14 60" /><path d="M8 48 l6 12 l12 -4" /></svg>
          <div key={roast} className="swap-in">
            <div className="script text-[30px] leading-none">{R.name} обжарка</div>
            <ul className="mt-2 space-y-0.5 text-[14px] text-white/80">
              <li>• {R.lead.toLowerCase()}</li>
              <li>• 250 г — {fmt(R.price)}</li>
            </ul>
          </div>
        </div>

        {/* правая колонка: карточки обжарок и второй заголовок */}
        <div className="relative z-20 flex min-w-0 flex-col items-start justify-between gap-8 py-4 lg:w-[440px] lg:items-end lg:py-14 lg:text-right">
          <div className="pointer-events-auto flex flex-col gap-5 lg:items-end">
            <div className="flex gap-2.5 pt-14 lg:gap-3 lg:pt-16">
              {roasts.map((r) => (
                <button key={r.id} type="button" className="rcard" aria-pressed={r.id === roast} onClick={() => pick(r.id)}>
                  <Bag tone={r.bag} label={r.name} className="bag" />
                  <div className="flex flex-col text-[12px]">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-white/60">250 г · {fmt(r.price)}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" className="arrow" aria-label="Предыдущая обжарка" onClick={() => step(-1)}>←</button>
              <button type="button" className="arrow" aria-label="Следующая обжарка" onClick={() => step(1)}>→</button>
            </div>
          </div>
          <h2 className="script display enter enter-3 hidden lg:block">Каждое<br />утро</h2>
        </div>
      </div>
    </section>
  );
}
