'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Одно авторское раскрытие на секцию: дети поднимаются из уже видимого состояния. */
export default function Reveal({
  children, className = '', stagger = 0.08, y = 24,
}: { children: React.ReactNode; className?: string; stagger?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current!;
    gsap.from(Array.from(el.children).slice(0, 8), {
      opacity: 0, y, duration: 0.55, stagger, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}
