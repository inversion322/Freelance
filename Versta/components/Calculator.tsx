'use client';
import { useMemo, useState, useEffect } from 'react';
import { projects, packages, options, estimate, fmt, fmtM, brand, type Package } from '@/lib/house';

const groups: { id: (typeof options)[number]['group']; title: string; single: boolean }[] = [
  { id: 'timber', title: 'Сечение бруса', single: true },
  { id: 'windows', title: 'Окна', single: true },
  { id: 'roof', title: 'Кровля', single: true },
  { id: 'extra', title: 'Дополнительно', single: false },
];

export default function Calculator({ picked }: { picked: string | null }) {
  const [pid, setPid] = useState(projects[3].id);
  const [pkg, setPkg] = useState<Package['id']>('warm');
  const [opts, setOpts] = useState<string[]>(['t202', 'w049', 'r-metal']);

  useEffect(() => { if (picked) { setPid(picked); const t = projects.find((p) => p.id === picked)!.timber; setOpts((o) => [...o.filter((x) => !x.startsWith('t')), `t${t}`]); } }, [picked]);

  const p = projects.find((x) => x.id === pid)!;
  const r = useMemo(() => estimate(p, pkg, opts), [p, pkg, opts]);

  function toggle(id: string, group: string, single: boolean) {
    setOpts((o) => single ? [...o.filter((x) => options.find((y) => y.id === x)?.group !== group), id] : o.includes(id) ? o.filter((x) => x !== id) : [...o, id]);
  }

  return (
    <section id="calc" className="bg-paper-2 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <h2 className="display-2 mb-4">Смета <em>до</em> выезда инженера</h2>
        <p className="mb-10 max-w-[56ch] text-muted">Вилка ±6 % — столько стоит неизвестный грунт. После геологии цена фиксируется в договоре и не меняется.</p>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="no-print space-y-9">
            <div>
              <div className="mb-3 text-[13px] text-muted">Проект</div>
              <div className="flex flex-wrap gap-2">
                {projects.map((x) => <button key={x.id} type="button" className="chip" aria-pressed={x.id === pid} onClick={() => setPid(x.id)}>{x.name}</button>)}
              </div>
            </div>
            <div>
              <div className="mb-3 text-[13px] text-muted">Комплектация</div>
              <div className="grid gap-3 md:grid-cols-3">
                {packages.map((k) => (
                  <button key={k.id} type="button" onClick={() => setPkg(k.id)} aria-pressed={pkg === k.id}
                    className={`press rounded-[16px] border p-4 text-left ${pkg === k.id ? 'border-pine bg-paper' : 'border-line hover:border-ink'}`}>
                    <div className="font-semibold">{k.title}</div>
                    <div className="mt-1 text-[13px] text-muted">{k.lead}</div>
                    <div className="mt-3 text-[13px] text-pine">{k.id === 'base' ? 'база' : `× ${k.k.toFixed(2)}`}</div>
                  </button>
                ))}
              </div>
            </div>
            {groups.map((g) => (
              <div key={g.id}>
                <div className="mb-3 text-[13px] text-muted">{g.title}</div>
                <div className="flex flex-wrap gap-2">
                  {options.filter((o) => o.group === g.id).map((o) => (
                    <button key={o.id} type="button" className="chip" aria-pressed={opts.includes(o.id)} title={o.note} onClick={() => toggle(o.id, g.id, g.single)}>
                      {o.title}{o.delta > 0 && <span className="ml-2 opacity-60">+{Math.round(o.delta * 100)}%</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* смета */}
          <aside className="card self-start p-6 md:p-8 lg:sticky lg:top-6">
            <div className="text-[13px] text-muted">{brand.name} · предварительная смета</div>
            <div className="mt-1 font-serif text-[30px]">{p.name}</div>
            <div className="text-[13px] text-muted">{p.area} м² · {p.floors === 1 ? '1 этаж' : '2 этажа'} · {p.bedrooms} спальни · {packages.find((k) => k.id === pkg)!.title}</div>
            <div className="hair mt-5 pt-5">
              <div className="text-[13px] text-muted">Вилка</div>
              <div className="font-serif text-[40px] leading-none text-pine md:text-[48px]">{fmtM(r.from)}</div>
              <div className="font-serif text-[28px] text-pine">— {fmtM(r.to)}</div>
              <div className="mt-2 text-[13px] text-muted">≈ {fmt(r.perM2)} за м²</div>
            </div>
            <div className="hair mt-5 pt-5 text-[13px]">
              <div className="mb-2 font-semibold">Что входит</div>
              <ul className="space-y-1 text-muted">{packages.find((k) => k.id === pkg)!.includes.map((i) => <li key={i}>— {i}</li>)}</ul>
              {opts.filter((o) => options.find((x) => x.id === o)?.delta).length > 0 && (
                <><div className="mb-2 mt-4 font-semibold">Опции</div>
                <ul className="space-y-1 text-muted">{opts.map((o) => options.find((x) => x.id === o)).filter((o) => o && o.delta > 0).map((o) => <li key={o!.id}>— {o!.title}</li>)}</ul></>
              )}
            </div>
            <div className="no-print mt-6 flex flex-wrap gap-3">
              <button type="button" className="pill pill-pine" onClick={() => window.print()}>Смета в PDF</button>
              <a href="#contact" className="pill pill-ghost">Выезд инженера</a>
            </div>
            <div className="print-only mt-6 text-[12px] text-muted">Предварительный расчёт, не оферта. Демонстрационный кейс, компания вымышленная.</div>
          </aside>
        </div>
      </div>
    </section>
  );
}
