/** Базовый путь сайта. Пустой локально, `/Freelance/Ostium` на GitHub Pages (задаётся при сборке). */
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const img = (name: string) => `${base}/img/${name}`;
