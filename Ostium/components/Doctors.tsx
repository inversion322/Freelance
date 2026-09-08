import Image from 'next/image';
import Reveal from './Reveal';
import { doctors } from '@/lib/clinic';

export default function Doctors() {
  return (
    <section id="doctors" className="dark bg-ink px-6 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="display-2 mb-14">Кто <em>оперирует</em></h2>
        <Reveal className="grid gap-10 md:grid-cols-3">
          {doctors.map((d) => (
            <article key={d.name}>
              <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[20px]">
                <Image src={d.img} alt={`${d.name}, ${d.role}`} fill sizes="(min-width:768px) 33vw, 100vw" className="bw scale-[1.05] object-cover" />
              </div>
              <div className="font-serif text-[26px]">{d.name}</div>
              <div className="text-[14px] text-muted-on-dark">{d.role} · стаж {d.years} лет</div>
              <div className="mt-3 text-[15px] font-medium">{d.focus}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-on-dark">{d.bio}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
