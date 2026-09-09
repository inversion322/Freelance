/** Базовый путь сайта. Пустой локально, `/Freelance/Versta` на GitHub Pages (задаётся при сборке). */
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Версия ассетов: короткий SHA коммита на Pages. Меняется с каждым деплоем, поэтому
 *  заменённая под тем же именем картинка не застревает в кэше браузера. */
const v = process.env.NEXT_PUBLIC_ASSET_VERSION ? `?v=${process.env.NEXT_PUBLIC_ASSET_VERSION}` : '';
export const img = (name: string) => `${base}/img/${name}${v}`;
