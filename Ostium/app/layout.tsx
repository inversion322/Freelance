import type { Metadata } from 'next';
import { Prata, Manrope } from 'next/font/google';
import './globals.css';

const prata = Prata({ weight: '400', subsets: ['cyrillic', 'latin'], variable: '--font-prata', display: 'swap' });
const manrope = Manrope({ subsets: ['cyrillic', 'latin'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Остеум — имплантация зубов за один день. Цену считаем при вас',
  description:
    'Клиника имплантологии: один зуб, сегмент или вся челюсть за один день. Рассчитайте вилку стоимости без телефона. Демонстрационный кейс.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${prata.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
