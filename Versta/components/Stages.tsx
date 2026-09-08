import Image from 'next/image';
import Reveal from './Reveal';
import { img } from '@/lib/base';
import { stages } from '@/lib/house';

export default function Stages() {
  return (
    <section id="stages" className="dark bg-ink px-6 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="display-2">От геологии<br />до <em>паспорта</em> дома</h2>
            <p className="mt-6 max-w-[40ch] text-muted-on-dark">Девять этапов, у каждого свой срок и свой акт приёмки. Коробка встаёт за месяц-полтора, дом под ключ — пять-семь месяцев от договора.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]"><Image src={img('build-1.jpg')} alt="Стропильная система" fill sizes="300px" className="object-cover" /></div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]"><Image src={img('build-2.jpg')} alt="Сборка дома на участке, вид сверху" fill sizes="300px" className="object-cover" /></div>
            </div>
          </div>
          <Reveal className="hair">
            {stages.map((s) => (
              <div key={s.n} className="hair grid grid-cols-[56px_1fr_auto] gap-4 py-5">
                <div className="font-serif text-[30px] leading-none text-muted-on-dark">{String(s.n).padStart(2, '0')}</div>
                <div>
                  <div className="text-[17px] font-semibold">{s.title}</div>
                  <p className="mt-1 max-w-[56ch] text-[14px] leading-relaxed text-muted-on-dark">{s.text}</p>
                </div>
                <div className="whitespace-nowrap text-[13px] text-muted-on-dark">{s.weeks} нед.</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
