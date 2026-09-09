import Hero from '@/components/Hero';
import Facts from '@/components/Facts';
import Roasts from '@/components/Roasts';
import Catalog from '@/components/Catalog';
import Process from '@/components/Process';
import Cafe from '@/components/Cafe';
import Subscribe from '@/components/Subscribe';
import { Reviews, Faq, Footer } from '@/components/Reviews';

export default function Page() {
  return (
    <main>
      <Hero />
      <Facts />
      <Roasts />
      <Catalog />
      <Process />
      <Cafe />
      <Subscribe />
      <Reviews />
      <Faq />
      <Footer />
    </main>
  );
}
