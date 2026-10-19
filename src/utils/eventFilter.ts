import type { VitalizarEvent, EventCategory } from '../types/index.ts';

export interface FilterOptions {
  category?: EventCategory | 'all';
  searchQuery?: string;
  month?: string; // e.g., '10', '11', '12' or 'all'
}

export function filterEvents(
  events: VitalizarEvent[],
  options: FilterOptions
): VitalizarEvent[] {
  const { category = 'all', searchQuery = '', month = 'all' } = options;
  const q = searchQuery.trim().toLowerCase();

  return events.filter((ev) => {
    // Category match
    if (category !== 'all' && ev.category !== category) {
      return false;
    }

    // Month match ('YYYY-MM-DD' -> parts[1])
    if (month !== 'all') {
      const eventMonth = ev.date.split('-')[1];
      if (eventMonth !== month) {
        return false;
      }
    }

    // Search query match
    if (q) {
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      const matchLoc = ev.location.toLowerCase().includes(q);
      const matchCoord = ev.coordinator.toLowerCase().includes(q);
      const matchAudience = ev.targetAudience.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchCoord && !matchAudience) {
        return false;
      }
    }

    return true;
  });
}

export function sortEventsByDate(
  events: VitalizarEvent[],
  ascending = true
): VitalizarEvent[] {
  return [...events].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return ascending ? diff : -diff;
  });
}

/** Data local de hoje no formato YYYY-MM-DD (sem conversão para UTC). */
export function todayIsoDate(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

export function isEventPast(event: VitalizarEvent): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.date < todayIsoDate();
}

/** Evento não aceita inscrições: sem vagas, marcado como "em breve/encerrado" no painel, ou já realizado. */
export function isEventClosed(event: VitalizarEvent): boolean {
  return event.availableSpots <= 0 || event.status === 'em_breve' || isEventPast(event);
}

/**
 * Recalcula o status automático após mudança de vagas. Status definidos pelas
 * regras automáticas (lotado / vagas limitadas) são revertidos quando vagas voltam.
 */
export function withSpotsStatus(event: VitalizarEvent, previousSpots?: number): VitalizarEvent {
  const spots = event.availableSpots;
  let status = event.status;
  if (spots <= 0) {
    status = 'em_breve';
  } else if (spots <= 5) {
    status = 'vagas_limitadas';
  } else if (
    status === 'vagas_limitadas' ||
    (status === 'em_breve' && previousSpots !== undefined && previousSpots <= 0)
  ) {
    status = 'inscricoes_abertas';
  }
  return status === event.status ? event : { ...event, status };
}

export function validateEventRSVP(
  event: VitalizarEvent,
  requestedSpots: number = 1
): { valid: boolean; reason: string } {
  if (requestedSpots <= 0) {
    return { valid: false, reason: 'Selecione ao menos 1 vaga.' };
  }

  if (isEventPast(event)) {
    return { valid: false, reason: 'Esta atividade já foi realizada.' };
  }

  if (event.status === 'em_breve') {
    return { valid: false, reason: 'Inscrições não estão abertas para esta atividade.' };
  }

  if (event.availableSpots <= 0) {
    return { valid: false, reason: 'Inscrições encerradas. Capacidade máxima atingida.' };
  }

  if (requestedSpots > event.availableSpots) {
    return {
      valid: false,
      reason: `Restam apenas ${event.availableSpots} vaga(s) disponível(is).`,
    };
  }

  return { valid: true, reason: 'Vagas disponíveis para confirmação imediata.' };
}

export function generateGoogleCalendarUrl(event: VitalizarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const title = encodeURIComponent(`${event.title} - Associação Esportiva Vitalizar`);
  const details = encodeURIComponent(
    `${event.description}\n\nCoordenação: ${event.coordinator}\nPúblico-alvo: ${event.targetAudience}\nLocal: ${event.location} (${event.address})`
  );
  const location = encodeURIComponent(`${event.location}, ${event.address}, Cariacica - ES`);

  // Usa o horário informado no painel (ex: "08:30 às 11:30" ou "18h30 - 20h") em horário local de Brasília
  const dateFormatted = event.date.replace(/-/g, '');
  const times = [...(event.time || '').matchAll(/(\d{1,2})\s*[:h]\s*(\d{2})?/g)].map(
    (m) => `${m[1].padStart(2, '0')}${m[2] || '00'}00`
  );
  const start = times[0] || '090000';
  const end = times[1] || (times[0] ? `${String(Math.min(23, Number(start.slice(0, 2)) + 2)).padStart(2, '0')}${start.slice(2)}` : '120000');
  const dates = `${dateFormatted}T${start}/${dateFormatted}T${end}`;

  return `${baseUrl}&text=${title}&details=${details}&location=${location}&dates=${dates}&ctz=America/Sao_Paulo`;
}
