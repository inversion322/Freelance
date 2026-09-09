'use client';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { img } from '@/lib/base';
import { stages } from '@/lib/house';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Этапы стройки проявляются ровно по мере прокрутки (scrub), а не разом:
 * строка въезжает слева и набирает прозрачность, номер загорается, линия слева растёт.
 * Фото слева чуть параллаксят. reduced-motion — всё стоит на месте.
 */
export default function Stages() {
  const wrap = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = wrap.current!;
    const rows = gsap.utils.toArray<HTMLElement>('.stage-row', root);
    rows.forEach((row) => {
      const num = row.querySelector('.stage-num');
      gsap.fromTo(row, { opacity: 0.12, x: 28 }, {
        opacity: 1, x: 0, ease: 'none',
        scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 62%', scrub: 0.4 },
      });
      if (num) gsap.fromTo(num, { color: '#5A544C' }, { color: '#EFEAE2', ease: 'none',
        scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 55%', scrub: 0.4 } });
    });
    gsap.fromTo('.stage-line', { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.stage-list', start: 'top 85%', end: 'bottom 60%', scrub: 0.4 } });
    gsap.fromTo('.stage-photo-a', { y: 24 }, { y: -24, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    gsap.fromTo('.stage-photo-b', { y: 40 }, { y: -12, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  }, { scope: wrap });

  return (
    <section id="stages" ref={wrap} className="dark bg-ink px-6 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="display-2">От геологии<br />до <em>паспорта</em> дома</h2>
            <p className="mt-6 max-w-[40ch] text-muted-on-dark">Девять этапов, у каждого свой срок и свой акт приёмки. Коробка встаёт за месяц-полтора, дом под ключ — пять-семь месяцев от договора.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="stage-photo-a relative aspect-[4/3] overflow-hidden rounded-[16px] will-change-transform"><Image src={img('build-1.jpg')} alt="Стропильная система" fill sizes="300px" className="object-cover" /></div>
              <div className="stage-photo-b relative aspect-[4/3] overflow-hidden rounded-[16px] will-change-transform"><Image src={img('build-2.jpg')} alt="Сборка дома на участке, вид сверху" fill sizes="300px" className="object-cover" /></div>
            </div>
          </div>
          <div className="stage-list relative pl-6 md:pl-8">
            <div className="absolute left-0 top-0 h-full w-px bg-line-dark" aria-hidden />
            <div className="stage-line absolute left-0 top-0 h-full w-px origin-top bg-white/80" aria-hidden />
            <div className="hair">
              {stages.map((s) => (
                <div key={s.n} className="stage-row hair grid grid-cols-[56px_1fr_auto] gap-4 py-5 will-change-transform">
                  <div className="stage-num font-serif text-[30px] leading-none text-muted-on-dark">{String(s.n).padStart(2, '0')}</div>
                  <div>
                    <div className="text-[17px] font-semibold">{s.title}</div>
                    <p className="mt-1 max-w-[56ch] text-[14px] leading-relaxed text-muted-on-dark">{s.text}</p>
                  </div>
                  <div className="whitespace-nowrap text-[13px] text-muted-on-dark">{s.weeks} нед.</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
