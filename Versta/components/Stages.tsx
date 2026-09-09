'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { img } from '@/lib/base';
import { stages } from '@/lib/house';
import { useStepScroll } from './useStepScroll';

/** фото к каждому этапу — реальная стройка, Pexels/Unsplash, см. CREDITS.md */
const photos: Record<number, { src: string; alt: string }> = {
  1: { src: 'st-1.jpg', alt: 'Геологическое бурение на участке' },
  2: { src: 'st-2.jpg', alt: 'Проект дома и договор на столе' },
  3: { src: 'st-3.jpg', alt: 'Свайный фундамент с ростверком' },
  4: { src: 'st-4.jpg', alt: 'Производство домокомплекта: брус на заводе' },
  5: { src: 'build-2.jpg', alt: 'Сборка стен и кровли на участке, вид сверху' },
  6: { src: 'st-6.jpg', alt: 'Монтаж окон в деревянном доме' },
  7: { src: 'st-7.jpg', alt: 'Инженерные сети: электрика и трубы' },
  8: { src: 'st-8.jpg', alt: 'Отделка: покрытие стен маслом' },
  9: { src: 'b-1.jpg', alt: 'Сданный дом' },
};

/**
 * Этапы — шаг за шагом. Секция закреплена, скролл переводит активный этап; список сам подъезжает,
 * держа активную строку в середине окна, поэтому все девять строк проходят перед глазами.
 * Слева — номер, название и фотография именно этого этапа. Клик по строке — переход.
 */
export default function Stages() {
  const { ref, active, pinned, goTo } = useStepScroll<HTMLElement>(stages.length, { perStep: 50 });
  const list = useRef<HTMLDivElement>(null);
  const cur = stages[active];
  const ph = photos[cur.n];

  // держим активную строку в центре видимой области списка
  useEffect(() => {
    const el = list.current; if (!el) return;
    if (!pinned) { el.style.transform = ''; return; }
    const row = el.children[active] as HTMLElement | undefined; if (!row) return;
    const box = el.parentElement!.clientHeight;
    const y = row.offsetTop + row.offsetHeight / 2 - box / 2;
    const max = Math.max(0, el.scrollHeight - box);
    el.style.transform = `translateY(${-Math.min(Math.max(y, 0), max)}px)`;
  }, [active, pinned]);

  return (
    <section id="stages" ref={ref} className="dark bg-ink px-6 py-20 text-white md:px-10 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden lg:py-0">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <div>
            <h2 className="display-2">От геологии<br />до <em>паспорта</em> дома</h2>
            <p className="mt-4 max-w-[40ch] text-[15px] text-muted-on-dark">Девять этапов, у каждого свой срок и свой акт приёмки. Коробка встаёт за месяц-полтора, дом под ключ — пять-семь месяцев от договора.</p>
            {pinned && (
              <div className="mt-6 border-t border-white/15 pt-5" aria-live="polite">
                <div key={active} className="layer-enter">
                  <div className="flex items-baseline gap-4">
                    <div className="font-serif text-[72px] leading-none">{String(cur.n).padStart(2, '0')}</div>
                    <div>
                      <div className="text-[18px] font-semibold">{cur.title}</div>
                      <div className="text-[13px] text-muted-on-dark">{cur.weeks} нед. · этап {cur.n} из {stages.length}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-px w-full bg-white/15"><div className="h-px bg-white transition-[width] duration-300 ease-out" style={{ width: `${((active + 1) / stages.length) * 100}%` }} /></div>
                <div key={'ph' + active} className="layer-enter relative mt-5 aspect-[16/10] w-full max-w-[520px] overflow-hidden rounded-[16px]">
                  <Image src={img(ph.src)} alt={ph.alt} fill sizes="520px" className="object-cover" />
                  <div className="absolute bottom-3 left-4 rounded-full bg-ink/70 px-3 py-1 text-[12px] text-white/90">{ph.alt}</div>
                </div>
              </div>
            )}
          </div>
          <div className="relative lg:h-[74vh] lg:overflow-hidden" style={{ maskImage: pinned ? 'linear-gradient(to bottom, transparent 0, #000 40px, #000 calc(100% - 60px), transparent 100%)' : undefined }}>
            <div ref={list} className="hair transition-transform duration-500 ease-out will-change-transform">
              {stages.map((s, i) => {
                const state = !pinned || i === active ? 'on' : i < active ? 'past' : 'off';
                return (
                  <button key={s.n} type="button" onClick={() => goTo(i)} aria-current={pinned && i === active ? 'step' : undefined}
                    className={`step-row hair grid w-full grid-cols-[56px_1fr_auto] gap-4 py-4 text-left ${state}`}>
                    <div className="step-num relative font-serif text-[30px] leading-none text-muted-on-dark"><span className="step-mark" aria-hidden />{String(s.n).padStart(2, '0')}</div>
                    <div>
                      <div className="text-[17px] font-semibold">{s.title}</div>
                      <p className="mt-1 max-w-[56ch] text-[14px] leading-relaxed text-muted-on-dark">{s.text}</p>
                    </div>
                    <div className="whitespace-nowrap text-[13px] text-muted-on-dark">{s.weeks} нед.</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
