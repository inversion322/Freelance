'use client';
import { useState } from 'react';
import { route, disclaimer } from '@/lib/clinic';

type Errors = Partial<Record<'name' | 'phone', string>>;

export default function Contact() {
  const [v, setV] = useState({ name: '', phone: '', note: '' });
  const [err, setErr] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function validate(field?: keyof typeof v) {
    const e: Errors = {};
    if (!v.name.trim()) e.name = 'Напишите, как к вам обращаться.';
    if (!/^\+?[\d\s()-]{10,}$/.test(v.phone)) e.phone = 'Телефон в формате +7 900 000-00-00.';
    if (field) setErr((p) => ({ ...p, [field]: e[field as keyof Errors] }));
    else setErr(e);
    return Object.keys(e).length === 0;
  }

  return (
    <footer id="contact" className="dark bg-ink px-6 pb-10 pt-20 text-white md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="display-2">Бесплатная КТ<br />и <em>план</em></h2>
            <p className="mt-6 max-w-[40ch] text-muted-on-dark">
              Снимок, план лечения и зафиксированная цена — за одно посещение, без обязательств.
            </p>
            <div className="mt-10 space-y-2 text-[15px] text-muted-on-dark">
              <div className="text-white">{route.district}</div>
              <div>{route.metro}</div>
              <div>{route.parking}</div>
              <div>{route.entrance}</div>
              <div>{route.hours}</div>
            </div>
          </div>

          {done ? (
            <div className="self-center rounded-[24px] bg-ink-2 p-10">
              <div className="font-serif text-[32px]">Записали.</div>
              <p className="mt-3 text-muted-on-dark">Перезвоним в рабочее время и подберём день для КТ. Это демонстрация — заявка никуда не отправлена.</p>
            </div>
          ) : (
            <form noValidate onSubmit={(e) => { e.preventDefault(); if (validate()) setDone(true); }} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[14px] text-muted-on-dark">Имя</span>
                  <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} onBlur={() => validate('name')}
                    className="w-full rounded-full border border-line-dark bg-transparent px-6 py-4 text-white placeholder:text-muted-on-dark/60"
                    placeholder="Анна" aria-invalid={!!err.name} aria-describedby="e-name" />
                  {err.name && <span id="e-name" role="alert" className="mt-2 block text-[13px] text-[#F0A08C]">{err.name}</span>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-[14px] text-muted-on-dark">Телефон</span>
                  <input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} onBlur={() => validate('phone')}
                    inputMode="tel" className="w-full rounded-full border border-line-dark bg-transparent px-6 py-4 text-white placeholder:text-muted-on-dark/60"
                    placeholder="+7 900 000-00-00" aria-invalid={!!err.phone} aria-describedby="e-phone" />
                  {err.phone && <span id="e-phone" role="alert" className="mt-2 block text-[13px] text-[#F0A08C]">{err.phone}</span>}
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[14px] text-muted-on-dark">Что беспокоит — по желанию</span>
                <textarea value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} rows={3}
                  className="w-full rounded-[26px] border border-line-dark bg-transparent px-6 py-4 text-white placeholder:text-muted-on-dark/60"
                  placeholder="Нет двух зубов слева снизу, удалили год назад" />
              </label>
              <div className="flex items-center gap-4">
                <button type="submit" className="pill pill-paper">Записаться на КТ <span aria-hidden>→</span></button>
                <span className="text-[13px] text-muted-on-dark">Никуда не отправляется: демонстрация.</span>
              </div>
            </form>
          )}
        </div>

        <div className="hair mt-20 grid gap-6 pt-8 text-[13px] text-muted-on-dark md:grid-cols-[1fr_auto]">
          <p className="max-w-[80ch]">{disclaimer}</p>
          <div>© 2026 Остеум · Демо-кейс</div>
        </div>
      </div>
    </footer>
  );
}
