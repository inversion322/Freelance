import type { Metadata } from 'next';
import { Raleway, JetBrains_Mono, Unbounded } from 'next/font/google';
import './globals.css';

const raleway = Raleway({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-raleway', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '700'], variable: '--font-jb', display: 'swap' });
const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'], weight: ['800'], variable: '--font-unbounded', display: 'swap' });

export const metadata: Metadata = {
  title: 'Гелий — студия аэродизайна в Москве. Арки, фотозоны, шаропад',
  description: 'Оформление праздников шарами: фотозоны, арки, шаропад до 1 000 шаров, фигуры и гелиевые связки. Эскиз за день, монтаж и демонтаж включены. Демонстрационный кейс.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${raleway.variable} ${mono.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
