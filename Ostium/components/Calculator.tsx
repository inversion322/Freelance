'use client';
import { useMemo, useState } from 'react';
import { scenarios, quiz, estimate, fmt, type Scenario } from '@/lib/clinic';

type Step = 'scenario' | 'bone' | 'system' | 'load' | 'result';
const order: Step[] = ['scenario', 'bone', 'system', 'load', 'result'];

export default function Calculator() {
  const [scenario, setScenario] = useState<Scenario['id'] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>('scenario');

  const idx = order.indexOf(step);
  const range = useMemo(() => (scenario ? estimate(scenario, answers) : null), [scenario, answers]);
  const progress = scenario ? Math.min(1, (idx + (step === 'result' ? 0 : 0)) / 4) : 0;

  // подсказка «+N ₽?» — чем изменится верхняя граница при самом дорогом ответе шага
  const hint = useMemo(() => {
    if (!scenario || step === 'scenario' || step === 'result') return null;
    const q = quiz.find((x) => x.id === step)!;
    const max = Math.max(...q.options.map((o) => o.delta));
    const now = estimate(scenario, answers).to;
    const then = estimate(scenario, { ...answers, [step]: q.options.find((o) => o.delta === max)!.id }).to;
    return then - now;
  }, [scenario, answers, step]);

  function next(current: Step) { setStep(order[order.indexOf(current) + 1]); }
  function reset() { setScenario(null); setAnswers({}); setStep('scenario'); }

  const s = scenarios.find((x) => x.id === scenario);
  const q = quiz.find((x) => x.id === step);

  return (
    <section id="calc" className="relative bg-paper px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex items-baseline justify-between text-[14px] text-muted">
          <span>Расчёт стоимости</span>
          <span aria-live="polite">{step === 'result' ? 'Готово' : `Шаг ${Math.min(idx + 1, 4)} из 4`}</span>
        </div>

        <div className="rounded-[28px] bg-paper-2 p-6 md:p-14">
          {step === 'scenario' && (
            <>
              <h2 className="display-2 mb-10">Что нужно восстановить?</h2>
              <div className="hair">
                {scenarios.map((x) => (
                  <button key={x.id} type="button"
                    onClick={() => { setScenario(x.id); next('scenario'); }}
                    className="row-arrow hair flex w-full items-center gap-6 py-6 text-left transition-colors hover:text-accent">
                    <span className="w-[48%] text-[20px] font-medium md:text-[26px]">{x.question}</span>
                    <span className="hidden text-muted md:block">{x.short}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {q && s && step !== 'result' && (
            <>
              <div className="mb-3 text-[14px] text-muted">{s.title}</div>
              <h2 className="display-2 mb-4">{q.question}</h2>
              <p className="mb-10 max-w-[56ch] text-muted">{q.hint}</p>
              <div className="hair">
                {q.options.map((o) => (
                  <button key={o.id} type="button"
                    onClick={() => { setAnswers((a) => ({ ...a, [q.id]: o.id })); next(step); }}
                    className="row-arrow hair flex w-full items-center gap-6 py-6 text-left transition-colors hover:text-accent">
                    <span className="text-[20px] font-medium md:text-[24px]">{o.label}</span>
                    {o.note && <span className="hidden text-[15px] text-muted md:block">{o.note}</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'result' && s && range && (
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
              <div>
                <div className="mb-3 text-[14px] text-muted">{s.title} · {s.short}</div>
                <h2 className="display mb-6 text-accent">
                  {fmt(range.from)}<br />— {fmt(range.to)}
                </h2>
                <p className="max-w-[52ch] text-muted">
                  Это вилка, а не сумма. Точную цифру фиксируем в договоре после КТ — снимок бесплатный,
                  и после него цена уже не меняется.
                </p>
              </div>
              <div className="text-[15px] leading-relaxed">
                <div className="hair py-4"><span className="text-muted">Протокол</span><br />{s.protocol}</div>
                <div className="hair py-4"><span className="text-muted">Сроки</span><br />{s.days}</div>
                <div className="hair pt-6 flex flex-wrap gap-3">
                  <a href="#contact" className="pill pill-accent">Записаться на КТ <span aria-hidden>→</span></a>
                  <button type="button" onClick={reset} className="pill pill-paper">Пересчитать</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* полоса накопления */}
        <div className="mt-6 flex items-center gap-4 text-[14px]">
          <div className="relative h-[52px] flex-1 overflow-hidden rounded-full bg-paper-2">
            <div className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(progress * 100, scenario ? 14 : 0)}%` }} />
            <div className="relative flex h-full items-center px-6 font-medium text-white mix-blend-difference">
              {range ? `${fmt(range.from)} — ${fmt(range.to)}` : 'Выберите случай — вилка появится сразу'}
            </div>
          </div>
          {hint !== null && hint > 0 && (
            <span className="hidden font-serif italic text-accent md:inline">+{fmt(hint)}?</span>
          )}
        </div>
      </div>
    </section>
  );
}
