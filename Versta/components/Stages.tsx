'use client';
import Image from 'next/image';
import { img } from '@/lib/base';
import { stages } from '@/lib/house';
import { useStepScroll } from './useStepScroll';

/**
 * Этапы стройки — шаг за шагом. На десктопе секция закрепляется, скролл переводит активный этап:
 * он подсвечен, остальные приглушены; слева крупно номер и название текущего. Клик по строке — переход.
 * На телефоне — обычный список.
 */
export default function Stages() {
  const { ref, active, pinned, goTo } = useStepScroll<HTMLElement>(stages.length, { perStep: 55 });
  const cur = stages[active];
  return (
    <section id="stages" ref={ref} className="dark bg-ink px-6 py-20 text-white md:px-10 lg:flex lg:min-h-[100svh] lg:items-center lg:py-0">
      <div className="mx-auto w-full max-w-[1240px] lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="display-2">От геологии<br />до <em>паспорта</em> дома</h2>
            <p className="mt-6 max-w-[40ch] text-muted-on-dark">Девять этапов, у каждого свой срок и свой акт приёмки. Коробка встаёт за месяц-полтора, дом под ключ — пять-семь месяцев от договора.</p>
            {pinned && (
              <div className="mt-8 border-t border-white/15 pt-6" aria-live="polite">
                <div key={active} className="layer-enter">
                  <div className="font-serif text-[88px] leading-none">{String(cur.n).padStart(2, '0')}</div>
                  <div className="mt-2 text-[20px] font-semibold">{cur.title}</div>
                  <div className="mt-1 text-[14px] text-muted-on-dark">{cur.weeks} нед. · этап {cur.n} из {stages.length}</div>
                </div>
                <div className="mt-5 h-px w-full bg-white/15"><div className="h-px bg-white transition-[width] duration-300 ease-out" style={{ width: `${((active + 1) / stages.length) * 100}%` }} /></div>
              </div>
            )}
            <div className="mt-8 grid max-w-[420px] grid-cols-2 gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]"><Image src={img('build-1.jpg')} alt="Стропильная система" fill sizes="220px" className="object-cover" /></div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]"><Image src={img('build-2.jpg')} alt="Сборка дома на участке, вид сверху" fill sizes="220px" className="object-cover" /></div>
            </div>
          </div>
          <div className="hair">
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
    </section>
  );
}
