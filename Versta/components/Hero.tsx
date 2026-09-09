'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { img } from '@/lib/base';
import { brand } from '@/lib/house';

gsap.registerPlugin(ScrollTrigger);

/** пока грузится чанк three.js (~1 МБ), справа стоит статичный кадр собранного дома */
const HouseScene = dynamic(() => import('./HouseScene'), {
  ssr: false,
  loading: () => <Image src={img('house-still.jpg')} alt="" aria-hidden fill sizes="50vw" className="object-cover object-center" />,
});

/** подписи слоёв — дом разбирается снизу вверх по мере скролла */
const layers = [
  { at: 0.0, title: 'Собранный дом', text: 'Домокомплект встаёт на участке за месяц-полтора.' },
  { at: 0.3, title: 'Кровля и свесы', text: 'Стропила со скользящими узлами под усадку, свес 550 мм. Гарантия 10 лет.' },
  { at: 0.55, title: 'Стеновой комплект', text: 'Клеёный брус 202–302 мм, венцы с чашами и перевязкой углов. Гарантия 50 лет.' },
  { at: 0.8, title: 'Фундамент', text: 'Сваи 200×200×3000 и ростверк 300×400 по отчёту геологии. Гарантия 50 лет.' },
];

export default function Hero() {
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [layer, setLayer] = useState(0);
  const [assembled, setAssembled] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current, start: 'top top', end: '+=140%', pin: true, scrub: 0.6,
      onUpdate: (self) => {
        progress.current = self.progress;
        let idx = 0; for (let i = 0; i < layers.length; i++) if (self.progress >= layers[i].at) idx = i;
        setLayer(idx); setAssembled(self.progress < 0.05);
      },
    });
    return () => st.kill();
  }, []);

  const L = layers[layer];

  return (
    <section ref={wrap} className="relative min-h-[100svh] overflow-hidden bg-ink text-white">
      {/* телефон и планшет: фотография; десктоп: дом на собственном тёмном поле */}
      <div className="absolute inset-0 md:hidden">
        <Image src={img('hero.jpg')} alt="" aria-hidden fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/40" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_60%_70%,#24352B_0%,#1C1915_65%)] md:block" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/60 to-transparent md:hidden" />

      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="font-serif text-[28px] tracking-tight">{brand.name}</a>
        <nav className="flex items-center gap-7 text-[14px]">
          <a href="#catalog" className="hidden hover:opacity-70 md:inline">Проекты</a>
          <a href="#calc" className="hidden hover:opacity-70 md:inline">Расчёт</a>
          <a href="#stages" className="hidden hover:opacity-70 md:inline">Как строим</a>
          <a href="#contact" className="pill pill-paper pill-enter">Выезд инженера</a>
        </nav>
      </header>

      <div className="relative z-10 grid min-h-[calc(100svh-96px)] items-end gap-8 px-6 pb-14 md:grid-cols-[1.05fr_1fr] md:items-center md:px-10 md:pb-16">
        <div>
          <h1 className="display max-w-[17ch] text-[40px] md:text-[clamp(44px,6vw,92px)]">Дом из бруса за&nbsp;один сезон, смета — в&nbsp;<em>договоре</em></h1>
          <p className="mt-8 max-w-[46ch] text-[17px] text-white/85">
            Двенадцать серийных проектов, три комплектации и расчёт с вилкой до выезда инженера. После геологии цена фиксируется и не меняется.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalog" className="pill pill-paper">Смотреть проекты</a>
            <a href="#calc" className="pill pill-pine">Рассчитать смету <span aria-hidden>→</span></a>
          </div>

          {/* подпись текущего слоя — только на десктопе, где есть сцена */}
          <div className="mt-10 hidden max-w-[40ch] border-t border-white/15 pt-5 md:block" aria-live="polite">
            <div key={layer} className="layer-enter">
              <div className="font-serif text-[24px]">{L.title}</div>
              <p className="mt-1 text-[14px] text-white/70">{L.text}</p>
            </div>
            <div className={`mt-4 text-[12px] text-white/45 transition-opacity duration-300 ${assembled ? 'opacity-100' : 'opacity-0'}`}>Прокрутите — дом разберётся на слои ↓</div>
          </div>
        </div>
        {/* 3D только с планшета и выше: на телефоне остаётся фотография */}
        <div className="pointer-events-none relative hidden h-[84vh] w-full md:block" aria-hidden>
          <HouseScene progress={progress} />
        </div>
      </div>
    </section>
  );
}
