import { reviews, faq, brand } from '@/lib/coffee';

export function Reviews() {
  return (
    <section className="px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="script display-2 mb-10">Что говорят <br />гости</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.name} className="card card-hover flex flex-col p-6">
              <p className="text-[16px] leading-relaxed">«{r.text}»</p>
              <footer className="hair mt-auto flex items-center justify-between pt-4 text-[13px]"><cite className="not-italic font-semibold">{r.name}</cite><span className="text-caramel">{r.tag}</span></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="bg-cream-2 px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="script display-2">Вопросы <br />и ответы</h2>
        <div>
          {faq.map((f) => (
            <details key={f.q} className="hair group py-4 first:border-0">
              <summary className="flex items-center justify-between gap-4 text-[17px] font-semibold"><span>{f.q}</span><span className="plus-i text-[22px] text-muted" aria-hidden>+</span></summary>
              <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink px-5 py-12 text-white md:px-[4%]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="script text-[40px] leading-none">{brand.name}</div>
          <div className="mt-2 text-[13px] text-white/60">{brand.tagline} · {brand.hours}</div>
        </div>
        <nav className="flex flex-wrap gap-5 text-[14px] text-white/80" aria-label="Подвал"><a href="#roasts">Обжарки</a><a href="#catalog">Сорта</a><a href="#cafe">Кофейня</a><a href="#subscribe">Подписка</a></nav>
      </div>
      <div className="mx-auto mt-8 max-w-[1180px] border-t border-white/10 pt-5 text-[12px] text-white/45">
        Демонстрационный кейс, компания вымышленная. Цены и сорта — пример. Фотографии: Pexels и Unsplash, авторы указаны в CREDITS.
      </div>
    </footer>
  );
}
