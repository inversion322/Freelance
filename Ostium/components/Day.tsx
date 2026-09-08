'use client';
import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { day } from '@/lib/clinic';
import { img } from '@/lib/base';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Единственная pin-секция страницы: регламент дня на тёмном поле. */
export default function Day() {
  const wrap = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;
    const items = gsap.utils.toArray<HTMLElement>('.day-item');
    const line = wrap.current!.querySelector<HTMLElement>('.day-line')!;
    gsap.set(items, { opacity: 0.28 });
    gsap.set(items[0], { opacity: 1 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: wrap.current, start: 'top top', end: `+=${items.length * 55}%`, scrub: 0.8, pin: true },
    });
    tl.to(line, { scaleY: 1, ease: 'none', duration: items.length }, 0);
    items.forEach((it, i) => {
      if (i > 0) tl.to(it, { opacity: 1, duration: 0.5, ease: 'power2.out' }, i);
      if (i < items.length - 1) tl.to(it, { opacity: 0.28, duration: 0.5 }, i + 0.85);
    });
    ScrollTrigger.refresh();
  }, { scope: wrap });

  return (
    <section ref={wrap} className="dark relative overflow-hidden bg-ink text-white">
      <div className="mx-auto grid min-h-[100svh] max-w-[1180px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1fr_1.4fr] md:px-10 md:py-20">
        <div>
          <h2 className="display-2">Один день,<br />по <em>часам</em></h2>
          <p className="mt-6 max-w-[40ch] text-muted-on-dark">
            Так выглядит день пациента, которому восстанавливают всю челюсть. Утром без зубов — вечером с несъёмным протезом.
          </p>
          <div className="relative mt-10 hidden aspect-[16/10] max-w-[440px] overflow-hidden rounded-[20px] md:block">
            <Image src={img('lab.png')} alt="Зуботехническая лаборатория клиники на том же этаже" fill sizes="440px" className="object-cover" />
            <div className="absolute bottom-3 left-4 text-[13px] text-white/80">Лаборатория на этаже операционной</div>
          </div>
        </div>
        <ol className="relative pl-8">
          <div className="absolute left-0 top-0 h-full w-px bg-line-dark" />
          <div className="day-line absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-white" />
          {day.map((d) => (
            <li key={d.time} className="day-item mb-5 md:mb-4">
              <div className="flex items-baseline gap-4">
                <div className="w-[88px] shrink-0 font-serif text-[24px] md:text-[30px]">{d.time}</div>
                <div>
                  <div className="text-[17px] font-semibold">{d.title}</div>
                  <p className="mt-0.5 max-w-[52ch] text-[15px] leading-snug text-muted-on-dark">{d.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
