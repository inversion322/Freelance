import Image from 'next/image';
import { process } from '@/lib/coffee';

export default function Process() {
  return (
    <section id="process" className="bg-cream-2 px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <h2 className="script display-2">От вишни <br />до чашки</h2>
          <p className="mt-6 max-w-[42ch] text-muted md:mt-0">Кофе — это ягода. Между фермой и вашей чашкой пять шагов, и на каждом мы знаем, что происходит с зерном.</p>
        </div>
        <ol className="space-y-6 md:space-y-8">
          {process.map((s, i) => (
            <li key={s.n} className={`grid items-center gap-6 md:grid-cols-2 md:gap-12 ${i % 2 ? 'md:[&>div:first-child]:order-2' : ''}`}>
              <div className="card-hover relative aspect-[4/3] overflow-hidden rounded-[22px] bg-cream">
                <Image src={s.img} alt={s.alt} fill sizes="(min-width:768px) 50vw, 100vw" fetchPriority="low" className="card-img object-cover" />
                <div className="script absolute left-5 top-4 text-[44px] text-white drop-shadow">{s.n}</div>
              </div>
              <div className="md:px-6">
                <h3 className="script text-[46px] leading-none">{s.title}</h3>
                <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
