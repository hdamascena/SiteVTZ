import type { NewsArticle } from '../types/index.ts';

/** Converte "dd/mm/aaaa" ou "dd/mm/aaaa HH:MM" em timestamp (0 se inválido). */
export function parseBrDateTime(value: string): number {
  const match = (value || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!match) return 0;
  const [, dd, mm, yyyy, hh = '0', mi = '0'] = match;
  const time = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi)).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Notícias mais recentes primeiro, conforme a data definida no painel. */
export function sortNewsByDate(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => parseBrDateTime(b.date) - parseBrDateTime(a.date));
}
