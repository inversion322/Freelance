import { price } from '@/lib/clinic';

export default function Price() {
  return (
    <section id="price" className="bg-paper-2 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <h2 className="display-2">Цены</h2>
          <p className="mt-4 max-w-[46ch] text-muted md:mt-0">
            Состав услуг — как в крупных московских клиниках. Диагностика бесплатно, если лечитесь у нас. «От» — потому что до КТ объём кости неизвестен.
          </p>
        </div>
        <div className="hair">
          {price.map((sec, i) => (
            <details key={sec.title} className="hair group" open={i === 1}>
              <summary className="flex items-center justify-between gap-6 py-6">
                <span className="font-serif text-[24px] md:text-[32px]">{sec.title}</span>
                <span className="plus font-serif text-[30px] leading-none" aria-hidden>+</span>
              </summary>
              <div className="pb-8 md:grid md:grid-cols-[1fr_1.4fr] md:gap-10">
                <p className="mb-6 text-[15px] text-muted md:mb-0">{sec.lead}</p>
                <div>
                  {sec.rows.map((r) => (
                    <div key={r.name} className="hair flex items-baseline justify-between gap-6 py-3 text-[16px]">
                      <span>{r.name}{r.note && <span className="block text-[13px] text-muted">{r.note}</span>}</span>
                      <span className="whitespace-nowrap font-medium">{r.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
