import Image from 'next/image';
import Reveal from './Reveal';
import { img } from '@/lib/base';
import { guarantee, service, built, faq } from '@/lib/house';

export default function Guarantee() {
  return (
    <>
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="display-2 mb-8">Гарантия <em>по срокам</em>,<br />а не по обещаниям</h2>
              <Reveal className="hair">
                {guarantee.map((g) => (
                  <div key={g.years} className="hair grid grid-cols-[110px_1fr] items-baseline gap-4 py-5">
                    <div className="font-serif text-[44px] leading-none text-pine">{g.years} <span className="text-[16px] text-muted">{g.years % 10 === 1 && g.years % 100 !== 11 ? 'год' : g.years % 10 >= 2 && g.years % 10 <= 4 && (g.years % 100 < 10 || g.years % 100 >= 20) ? 'года' : 'лет'}</span></div>
                    <div><div className="font-semibold">{g.what}</div><div className="text-[14px] text-muted">{g.text}</div></div>
                  </div>
                ))}
              </Reveal>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {service.map((s) => <div key={s.k}><div className="font-serif text-[26px] leading-none">{s.k}</div><div className="mt-1 text-[13px] text-muted">{s.v}</div></div>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:mt-16">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[20px]"><Image src={img('g-rafters.jpg')} alt="Стропильная система и обрешётка из клеёного бруса" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-[20px]"><Image src={img('g-frame.jpg')} alt="Каркас кровли на стойках из клеёного бруса" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>
            </div>
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
