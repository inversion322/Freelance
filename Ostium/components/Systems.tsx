import Image from 'next/image';
import Reveal from './Reveal';
import { systems, fmt } from '@/lib/clinic';
import { img } from '@/lib/base';

export default function Systems() {
  return (
    <section className="bg-paper px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1fr_1.1fr] md:items-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] md:sticky md:top-24">
          <Image src={img('implant-macro.png')} alt="Титановый имплант в пинцете, крупно" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="display-2 mb-4">Четыре системы.<br />Одна <em>гарантия</em></h2>
          <p className="mb-10 max-w-[52ch] text-muted">
            Бессрочная гарантия производителя на каждую. Разница в цене — в сплаве, поверхности и протоколе, а не в надёжности.
          </p>
          <Reveal className="hair">
            {systems.map((s) => (
              <div key={s.id} className="hair grid gap-2 py-6 md:grid-cols-[180px_1fr_auto] md:items-baseline md:gap-6">
                <div>
                  <div className="text-[20px] font-semibold">{s.name}</div>
                  <div className="text-[14px] text-muted">{s.origin}</div>
                </div>
                <p className="text-[15px] text-muted">{s.note}</p>
                <div className="font-serif text-[22px] text-accent">от {fmt(s.singleFrom)}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
