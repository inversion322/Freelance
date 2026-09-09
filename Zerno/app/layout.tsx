import type { Metadata } from 'next';
import { Marck_Script, Manrope } from 'next/font/google';
import './globals.css';

const script = Marck_Script({ weight: '400', subsets: ['cyrillic', 'latin'], variable: '--font-script', display: 'swap' });
const manrope = Manrope({ subsets: ['cyrillic', 'latin'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Зерно — спешелти-кофе свежей обжарки в Москве. Сорта, подписка, кофейня',
  description: 'Обжариваем зерно в Москве дважды в неделю и отправляем в течение 48 часов. Восемь сортов трёх обжарок, подписка со скидкой, открытый каппинг по субботам. Демонстрационный кейс.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${script.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
