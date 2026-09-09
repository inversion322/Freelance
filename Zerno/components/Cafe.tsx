import Image from 'next/image';
import { img } from '@/lib/base';
import { brand, menu, fmt } from '@/lib/coffee';

export default function Cafe() {
  return (
    <section id="cafe" className="px-5 py-20 md:px-[4%] md:py-28">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <h2 className="script display-2">Кофейня <br />и стойка бариста</h2>
          <p className="mt-8 max-w-[48ch] text-muted">Небольшой зал в центре Москвы, {brand.hours}. Всё, что в меню, готовим на своём зерне недельной обжарки: эспрессо — на смеси «Утро», фильтр — на сезонном лоте, который меняется каждую неделю.</p>
          <ul className="mt-6 space-y-2 text-[15px]">
            <li>• Открытый каппинг по субботам в 12:00</li>
            <li>• Помол и рецепт под вашу кофеварку — спросите бариста</li>
            <li>• Зерно с витрины — по ценам сайта</li>
          </ul>
          <div className="card-hover relative mt-8 aspect-[16/10] overflow-hidden rounded-[22px] bg-cream-2">
            <Image src={img('cafe.jpg')} alt="Бариста готовит фильтр-кофе за стойкой" fill sizes="(min-width:1024px) 50vw, 100vw" fetchPriority="low" className="card-img object-cover" />
          </div>
        </div>
        <div className="card self-start p-6 md:p-8">
          <div className="script text-[40px] leading-none">Меню</div>
          <ul className="mt-5">
            {menu.map((m) => (
              <li key={m.name} className="hair flex items-baseline justify-between py-3 first:border-0">
                <span>{m.name}</span><span className="mx-3 flex-1 border-b border-dotted border-line" /><span className="font-semibold">{fmt(m.price)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px] text-muted">Альтернативное молоко +60 ₽. Любой напиток — на сезонном зерне по запросу.</p>
        </div>
      </div>
    </section>
  );
}
