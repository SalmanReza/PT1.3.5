/* Author, copyright and version metadata shown in the interface. */
export const APP_VERSION = '1.3.5';
export const AUTHOR = { en: 'Salman Reza Amit', bn: 'সালমান রেজা অমিত' };
export const COPYRIGHT = {
  en: '© 2026–2027 Salman Reza Amit',
  bn: '© ২০২৬–২০২৭ সালমান রেজা অমিত'
};

export function copyrightText(language = 'en') {
  return language === 'bn' ? COPYRIGHT.bn : COPYRIGHT.en;
}
