import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({ weight: ['500', '600'], style: ['normal', 'italic'], subsets: ['cyrillic', 'latin'], variable: '--font-cormorant', display: 'swap' });
const manrope = Manrope({ subsets: ['cyrillic', 'latin'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Верста — дома из клеёного бруса. Каталог проектов и расчёт сметы',
  description:
    'Двенадцать серийных проектов из клеёного бруса с фильтрами, калькулятор сметы по комплектациям и опциям, гарантия 50 лет на конструктив. Демонстрационный кейс.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
