'use client';
import { useState } from 'react';
import Hero from './Hero';
import Catalog from './Catalog';
import Calculator from './Calculator';
import Stages from './Stages';
import Guarantee from './Guarantee';
import Contact from './Contact';

export default function Landing() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <main>
      <Hero />
      <Catalog onPick={(id) => { setPicked(id); document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth' }); }} />
      <Calculator picked={picked} />
      <Stages />
      <Guarantee />
      <Contact />
    </main>
  );
}
