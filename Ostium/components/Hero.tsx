import Image from 'next/image';
import { route } from '@/lib/clinic';
import { img } from '@/lib/base';

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* фото: на десктопе правая половина, на телефоне весь экран */}
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2">
        <Image src={img('operating-room.jpg')} alt="Операционная клиники, хирург и ассистент за работой"
          fill priority sizes="(min-width: 768px) 50vw, 100vw" className="kb object-cover object-[50%_30%]" />
        <div className="absolute inset-0 bg-ink/40 md:bg-transparent" />
      </div>
      <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-paper md:block" />

      {/* шапка: одна кнопка на все размеры, всегда над фото */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="font-serif text-[26px] tracking-tight text-white md:text-ink">Остеум</a>
        <nav className="flex items-center gap-8 text-[15px] text-white [text-shadow:0_1px_12px_rgba(0,0,0,.35)]">
          <a href="#calc" className="hidden transition-opacity hover:opacity-70 md:inline">Расчёт</a>
          <a href="#price" className="hidden transition-opacity hover:opacity-70 md:inline">Цены</a>
          <a href="#doctors" className="hidden transition-opacity hover:opacity-70 md:inline">Врачи</a>
          <a href="#contact" className="pill pill-paper pill-enter">Записаться <span aria-hidden className="plus-icon">+</span></a>
        </nav>
      </header>

      {/* заголовок: один цвет, на десктопе целиком на листе, на телефоне белый над затемнённым фото */}
      <div className="relative z-10 flex min-h-[calc(100svh-96px)] flex-col justify-center px-6 md:w-1/2 md:px-10">
        <h1 className="display text-white md:text-ink">
          Новые зубы<br />за <em>один</em> день
        </h1>
        <p className="mt-6 max-w-[38ch] text-[17px] text-white/85 md:text-muted">
          Один зуб, несколько или вся челюсть. Цену считаем при вас — до телефона и до кресла.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#calc" className="pill pill-accent">Рассчитать вилку <span aria-hidden>↓</span></a>
          <span className="text-[14px] text-white/75 md:text-muted">Бесплатно, без регистрации</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 z-20 hidden text-[14px] leading-snug text-muted md:left-10 md:block">
        <div className="mb-2 text-[13px]">Клиника имплантологии</div>
        <div className="font-semibold text-ink">{route.district.split(', ')[1]}</div>
        <div className="font-semibold text-ink">{route.metro.split(' · ')[0]}</div>
      </div>
    </section>
  );
}
