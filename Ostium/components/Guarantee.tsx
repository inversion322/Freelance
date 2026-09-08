import Image from 'next/image';
import Reveal from './Reveal';
import { guarantee, faq } from '@/lib/clinic';
import { img } from '@/lib/base';

export default function Guarantee() {
  return (
    <>
      <section className="bg-paper px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="display-2 mb-10">Что записано<br />в <em>договоре</em></h2>
            <Reveal className="hair">
              {guarantee.map((g) => (
                <div key={g.title} className="hair py-6">
                  <div className="text-[20px] font-semibold">{g.title}</div>
                  <p className="mt-1 max-w-[56ch] text-muted">{g.text}</p>
                </div>
              ))}
            </Reveal>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] md:mt-24">
            <Image src={img('ct-consult.png')} alt="Врач показывает пациенту КТ-снимок на мониторе" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-paper-2 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px] md:grid md:grid-cols-[1fr_1.6fr] md:gap-12">
          <h2 className="display-2 mb-10">Вопросы</h2>
          <div className="hair">
            {faq.map((f) => (
              <details key={f.q} className="hair">
                <summary className="flex items-center justify-between gap-6 py-5 text-[19px] font-medium">
                  {f.q}<span className="plus font-serif text-[26px] leading-none" aria-hidden>+</span>
                </summary>
                <p className="max-w-[64ch] pb-6 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
