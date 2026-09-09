import { facts } from '@/lib/coffee';

/** круглые бейджи-факты, как у palmo: кольцо вращается, число стоит */
export default function Facts() {
  return (
    <section className="px-5 py-16 md:px-[4%] md:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 md:grid-cols-4">
        {facts.map((f, i) => {
          const dark = i % 2 === 0;
          return (
            <div key={f.label} className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center">
              <svg viewBox="0 0 200 200" className="badge-ring absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="100" cy="100" r="94" fill={dark ? 'var(--color-ink-2)' : 'var(--color-accent)'} stroke="var(--color-ink-2)" strokeWidth="3" />
                <circle cx="100" cy="100" r="82" fill="none" stroke={dark ? 'var(--color-accent)' : 'var(--color-ink-2)'} strokeWidth="1.5" strokeDasharray="3 9" />
              </svg>
              <div className={`relative px-7 text-center ${dark ? 'text-accent' : 'text-ink-2'}`}>
                <div className="script text-[64px] leading-none">{f.n}<span className="text-[34px]">{f.unit}</span></div>
                <div className="mt-1 text-[13px] font-semibold leading-tight">{f.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
