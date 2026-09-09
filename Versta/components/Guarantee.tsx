'use client';
import Image from 'next/image';
import Reveal from './Reveal';
import { guarantee, service, built, faq } from '@/lib/house';
import { useStepScroll, years } from './useStepScroll';

export default function Guarantee() {
  const { ref, active, pinned, goTo } = useStepScroll<HTMLElement>(guarantee.length, { perStep: 70 });
  const g = guarantee[active];
  return (
    <>
      {/* Гарантия — цифры в ряд, читаются одна за другой: активная крупная, остальные приглушены */}
      <section ref={ref} className="px-6 py-20 md:px-10 lg:flex lg:min-h-[100svh] lg:items-center lg:py-0">
        <div className="mx-auto w-full max-w-[1240px] lg:py-14">
          <h2 className="display-2 mb-12">Гарантия <em>по срокам</em>,<br />а не по обещаниям</h2>

          <div className="relative grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 md:grid-cols-4">
            {pinned && (
              <div className="absolute left-0 top-[-1px] h-[2px] bg-pine transition-transform duration-300 ease-out"
                style={{ width: `${100 / guarantee.length}%`, transform: `translateX(${active * 100}%)` }} aria-hidden />
            )}
            {guarantee.map((x, i) => (
              <button key={x.years} type="button" onClick={() => goTo(i)} aria-current={pinned && i === active ? 'step' : undefined}
                className={`gstep text-left ${!pinned || i === active ? 'on' : 'off'}`}>
                <div className="font-serif text-[clamp(56px,7vw,112px)] leading-none text-pine">
                  {x.years}<span className="ml-2 font-serif text-[18px] text-muted">{years(x.years)}</span>
                </div>
                <div className="mt-2 text-[15px] font-semibold">{x.what}</div>
              </button>
            ))}
          </div>

          <div className="mt-12 lg:min-h-[132px]">
            {pinned ? (
              <div key={active} className="layer-enter max-w-[62ch]" aria-live="polite">
                <div className="font-serif text-[34px] leading-tight md:text-[40px]">{g.what}</div>
                <p className="mt-3 text-[17px] text-muted">{g.text}</p>
                <div className="mt-3 text-[13px] text-muted">{active + 1} из {guarantee.length} · прокрутите или нажмите на цифру</div>
              </div>
            ) : (
              <div className="hair">
                {guarantee.map((x) => (
                  <div key={x.years} className="hair py-4"><div className="font-semibold">{x.what}</div><div className="text-[14px] text-muted">{x.text}</div></div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-line pt-8 md:grid-cols-4">
            {service.map((s) => <div key={s.k}><div className="font-serif text-[26px] leading-none">{s.k}</div><div className="mt-1 text-[13px] text-muted">{s.v}</div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-paper-2 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="display-2 mb-10">Построено <em>под Москвой</em></h2>
          <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {built.map((b) => (
              <article key={b.name} className="card">
                <div className="relative aspect-[4/3]"><Image src={b.img} alt={b.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>
                <div className="p-4"><div className="font-semibold">{b.name}</div><div className="text-[13px] text-muted">{b.dist} · {b.year}</div></div>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px] lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-12">
          <h2 className="display-2 mb-10">Вопросы</h2>
          <div className="hair">
            {faq.map((f) => (
              <details key={f.q} className="hair">
                <summary className="flex items-center justify-between gap-6 py-5 text-[18px] font-medium">{f.q}<span className="plus font-serif text-[28px] leading-none" aria-hidden>+</span></summary>
                <p className="max-w-[64ch] pb-6 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
