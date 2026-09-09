'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Пошаговый скролл: секция закрепляется, прогресс переводит активный пункт по одному.
 * На узких экранах и при reduced-motion — обычный список без закрепления (pinned = false).
 */
export function useStepScroll<T extends HTMLElement>(count: number, opts?: { minWidth?: number; perStep?: number }) {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const minW = opts?.minWidth ?? 1024;
    if (!ref.current || window.innerWidth < minW || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPinned(true);
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top top', end: `+=${count * (opts?.perStep ?? 55)}%`, pin: true, scrub: 0.5,
      onUpdate: (self) => setActive(Math.min(count - 1, Math.floor(self.progress * count))),
    });
    stRef.current = st;
    return () => { st.kill(); stRef.current = null; setPinned(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const goTo = (i: number) => {
    const st = stRef.current; if (!st) return;
    window.scrollTo({ top: st.start + ((i + 0.5) / count) * (st.end - st.start), behavior: 'smooth' });
  };
  return { ref, active, pinned, goTo };
}

export const years = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'года' : 'лет';
