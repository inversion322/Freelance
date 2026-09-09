'use client';
import { useState } from 'react';
import { roasts, fmt, type RoastId } from '@/lib/coffee';

const weights = [250, 500, 1000] as const;
const periods = [{ id: 2, label: 'раз в 2 недели' }, { id: 4, label: 'раз в 4 недели' }] as const;

export default function Subscribe() {
  const [roast, setRoast] = useState<RoastId>('medium');
  const [w, setW] = useState<(typeof weights)[number]>(500);
  const [p, setP] = useState<2 | 4>(2);
  const R = roasts.find((r) => r.id === roast)!;
  const price = Math.round((R.price * (w / 250) * 0.9) / 10) * 10;
  const perCup = Math.round(price / (w / 15));

  return (
    <section id="subscribe" className="scallop mt-16 bg-ink-2 px-5 pb-20 pt-24 text-white md:px-[4%] md:pb-28 md:pt-32">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="script display-2 text-accent">Подписка на свежее зерно</h2>
          <p className="mx-auto mt-8 max-w-[560px] text-center text-white/70">Обжариваем под вашу дату и отправляем в день обжарки. Минус 10 % к цене, пауза и смена сорта в один клик.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-[980px] gap-8 rounded-[26px] border border-white/12 bg-white/5 p-6 md:grid-cols-[1.3fr_1fr] md:p-10">
          <div className="space-y-7">
            <div>
              <div className="mb-3 text-[13px] text-white/60">Обжарка</div>
              <div className="flex flex-wrap gap-2">{roasts.map((r) => <button key={r.id} type="button" onClick={() => setRoast(r.id)} aria-pressed={roast === r.id} className="chip border-white/25 text-white aria-pressed:bg-accent aria-pressed:text-ink-2 aria-pressed:border-accent">{r.name}</button>)}</div>
            </div>
            <div>
              <div className="mb-3 text-[13px] text-white/60">Вес</div>
              <div className="flex flex-wrap gap-2">{weights.map((x) => <button key={x} type="button" onClick={() => setW(x)} aria-pressed={w === x} className="chip border-white/25 text-white aria-pressed:bg-accent aria-pressed:text-ink-2 aria-pressed:border-accent">{x >= 1000 ? '1 кг' : `${x} г`}</button>)}</div>
            </div>
            <div>
              <div className="mb-3 text-[13px] text-white/60">Периодичность</div>
              <div className="flex flex-wrap gap-2">{periods.map((x) => <button key={x.id} type="button" onClick={() => setP(x.id)} aria-pressed={p === x.id} className="chip border-white/25 text-white aria-pressed:bg-accent aria-pressed:text-ink-2 aria-pressed:border-accent">{x.label}</button>)}</div>
            </div>
          </div>
          <aside className="rounded-[20px] bg-ink p-6">
            <div className="text-[13px] text-white/60">{R.name} обжарка · {w >= 1000 ? '1 кг' : `${w} г`} · {periods.find((x) => x.id === p)!.label}</div>
            <div className="script mt-3 text-[56px] leading-none text-accent">{fmt(price)}</div>
            <div className="mt-1 text-[13px] text-white/60">за отправку, около {perCup} ₽ за чашку</div>
            <ul className="mt-5 space-y-1.5 text-[14px] text-white/80">
              <li>— Следующая обжарка: вторник</li>
              <li>— Доставка по Москве включена</li>
              <li>— Отмена в любой момент</li>
            </ul>
            <button type="button" className="pill pill-accent mt-6 w-full justify-center">Оформить подписку</button>
            <div className="mt-3 text-center text-[12px] text-white/45">Демонстрационный кейс: заказ не оформляется</div>
          </aside>
        </div>
      </div>
    </section>
  );
}
