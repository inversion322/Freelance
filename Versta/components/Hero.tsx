'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { img } from '@/lib/base';
import { brand } from '@/lib/house';

const HouseScene = dynamic(() => import('./HouseScene'), { ssr: false, loading: () => null });

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink text-white">
      {/* телефон и планшет: фотография; десктоп: дом стоит на собственном тёмном поле, без фото под ним */}
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
        </div>
        {/* 3D: дом собирается венец за венцом и поворачивается за курсором. Только с планшета и выше:
            на телефоне пустой блок и 1,8 МБ скриптов не окупаются — там остаётся фотография */}
        <div className="pointer-events-none hidden h-[74vh] w-full md:block" aria-hidden>
          <HouseScene />
        </div>
      </div>
    </section>
  );
}
