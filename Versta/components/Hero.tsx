import Image from 'next/image';
import { img } from '@/lib/base';
import { brand } from '@/lib/house';

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden text-white">
      <Image src={img('hero.jpg')} alt="Дом из клеёного бруса в лесу" fill priority sizes="100vw" className="kb object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-ink/70" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="font-serif text-[28px] tracking-tight">{brand.name}</a>
        <nav className="flex items-center gap-7 text-[14px]">
          <a href="#catalog" className="hidden hover:opacity-70 md:inline">Проекты</a>
          <a href="#calc" className="hidden hover:opacity-70 md:inline">Расчёт</a>
          <a href="#stages" className="hidden hover:opacity-70 md:inline">Как строим</a>
          <a href="#contact" className="pill pill-paper">Выезд инженера</a>
        </nav>
      </header>

      <div className="relative z-10 flex min-h-[calc(100svh-96px)] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
        <h1 className="display max-w-[17ch] text-[40px] md:text-[clamp(44px,6.4vw,96px)]">Дом из бруса за&nbsp;один сезон, смета — в&nbsp;<em>договоре</em></h1>
        <p className="mt-8 max-w-[46ch] text-[17px] text-white/85">
          Двенадцать серийных проектов, три комплектации и расчёт с вилкой до выезда инженера. После геологии цена фиксируется и не меняется.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#catalog" className="pill pill-paper">Смотреть проекты</a>
          <a href="#calc" className="pill pill-pine">Рассчитать смету <span aria-hidden>→</span></a>
        </div>
      </div>
    </section>
  );
}
