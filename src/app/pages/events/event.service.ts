import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../shared/services/auth.service';

export interface ApiEvent {
  id: number | string;
  name?: string;
  title?: string;
  description?: string | null;
  details?: string;
  start_date?: string;
  startDate?: string;
  start_datetime?: string;
  end_date?: string;
  endDate?: string;
  end_datetime?: string;
  banner_url?: string | null;
  image?: string | null;
  slug?: string;
  id_code?: string;
  // Card background fields
  color_1?: string | null;
  color_2?: string | null;
  card_background?: string | null;
  card_background_type?: number | null; // 0 = colors (gradient), 1 = image
  // add any other fields from API as needed
}

export interface EventsApiResponse {
  success: boolean;
  message?: string;
  data: {
    events: ApiEvent[];
  };
}

export interface EventDetailApiResponse {
  success: boolean;
  data: {
    event: ApiEvent;
    total_responses?: number;
  };
}

export interface CreateEventPayload {
  name: string;
  slug: string;
  banner_url: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  place: string;
  resp_email: string;
  resp_name: string;
  resp_phone: string;
  color_1: string;
  color_2: string;
  card_background?: string | null;
  card_background_type?: number | null; // 0 colors, 1 image
}

export interface EventCreateApiResponse {
  success: boolean;
  data?: { event?: ApiEvent; events?: ApiEvent[] };
  message?: string;
}

export interface EventListItem {
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  id_code?: string;
  links: Array<{ text: string; url: string; variant: 'primary' | 'outline' | 'info' | 'warning' }>;
}

// ================================
// Guests API Types
// ================================
export interface ApiGuestDocument { type?: string; number?: string }
export interface ApiGuest {
  id: number;
  display_name: string;
  avatar_url?: string | null;
  email: string;
  document?: ApiGuestDocument | null;
  phone?: string;
  type?: string;
  origin_status?: string;
  // RSVP
  rsvp?: boolean; // compat
  rsvp_confirmed?: boolean | number | null; // coluna oficial pode vir 0/1
  rsvp_at?: string | null;
  invited_at?: string | null;
  invited_by_user_id?: number | null;
  // Check-in
  check_in_at?: string | null;
  check_in_method?: string | null;
  authorized_by_user?: number | null;
  // Extras
  source?: string | null;
  guest_number?: number | null;
  guest_document_type?: string | null;
  guest_phone?: string | null;
  guest_email?: string | null;
  guestname?: string | null;
}

export interface ApiGuestUpdatePayload {
  rsvp_confirmed?: boolean | number | null;
  rsvp_at?: string | null;
  check_in_at?: string | null;
  check_in_method?: string | null;
  authorized_by_user?: number | null;
  // Dados de perfil
  display_name?: string;
  email?: string;
  phone?: string;
  document?: ApiGuestDocument | null;
  type?: string;
}

export interface GuestsApiResponse {
  success: boolean;
  data: { guests: ApiGuest[] };
  message?: string;
}

// Guests stats (para KPIs de convidados)
export interface GuestsStats {
  total_guests: number;
  rsvp_count: number;
  checkin_count: number;
  by_source?: Record<string, number>;
  by_type?: Record<string, number>;
  by_check_in_method?: Record<string, number>;
}

// Resposta com guests e stats juntos
export interface GuestsWithStatsApiResponse {
  success: boolean;
  data: { guests: ApiGuest[]; stats?: GuestsStats };
  meta?: any;
  message?: string;
}

export interface CreateEventGuestPayload {
  display_name: string;
  email: string;
  phone?: string;
  document?: ApiGuestDocument | null;
  check_in_at?: string | null;
}

// Novo: criação em lote na pré-lista
export interface CreateGuestBatchItem {
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  guest_document_type: 'rg' | 'cpf' | 'passport';
  guest_document_number: string;
  type: 'normal' | 'vip' | 'premium';
  source?: 'invited' | 'walk_in';
}

// Novo: check-in manual imediato
export interface CheckinManualPayload {
  guest_name: string;
  guest_phone?: string | null;
  guest_document_type: 'rg' | 'cpf' | 'passport';
  guest_document_number: string;
  type: 'normal' | 'vip' | 'premium';
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEvents(): Observable<EventListItem[]> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    return this.http.get<EventsApiResponse>(`${this.API_BASE_URL}/events`, { headers }).pipe(
      map((resp) => {
        const events = resp?.data?.events ?? [];
        return events.map((ev) => this.mapApiEventToListItem(ev));
      })
    );
  }

  // Lista convidados do evento por id_code (ou ID) com paginação/filtros simples
  getEventGuests(idOrCode: string, params?: {
    page?: number;
    page_size?: number;
    search?: string;
    type?: string;
    source?: string;
    checked_in?: boolean;
    rsvp?: boolean;
  }): Observable<ApiGuest[]> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.source) query.set('source', params.source);
    if (typeof params?.checked_in === 'boolean') query.set('checked_in', String(params.checked_in));
    if (typeof params?.rsvp === 'boolean') query.set('rsvp', String(params.rsvp));

    const qs = query.toString();
    const url = `${this.API_BASE_URL}/events/${idOrCode}/guests${qs ? `?${qs}` : ''}`;

    return this.http.get<GuestsApiResponse>(url, { headers }).pipe(
      map((resp) => resp?.data?.guests ?? [])
    );
  }

  // Versão que também retorna stats para KPIs
  getEventGuestsWithStats(idOrCode: string, params?: {
    page?: number;
    page_size?: number;
    search?: string;
    type?: string;
    source?: string;
    checked_in?: boolean;
    rsvp?: boolean;
  }): Observable<{ guests: ApiGuest[]; stats?: GuestsStats }> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.source) query.set('source', params.source);
    if (typeof params?.checked_in === 'boolean') query.set('checked_in', String(params.checked_in));
    if (typeof params?.rsvp === 'boolean') query.set('rsvp', String(params.rsvp));

    const qs = query.toString();
    const url = `${this.API_BASE_URL}/events/${idOrCode}/guests${qs ? `?${qs}` : ''}`;

    return this.http.get<GuestsWithStatsApiResponse>(url, { headers }).pipe(
      map((resp) => ({ guests: resp?.data?.guests ?? [], stats: resp?.data?.stats }))
    );
  }

  // Atualiza campos de um convidado do evento
  updateEventGuest(idOrCode: string | number, guestId: number, changes: ApiGuestUpdatePayload): Observable<ApiGuest> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/guests/${guestId}`;
    return this.http.patch<{ success: boolean; data: { guest: ApiGuest } }>(url, changes, { headers }).pipe(
      map((resp) => resp?.data?.guest)
    );
  }

  // Cria um convidado (pré-convidado) para o evento
  createEventGuest(idOrCode: string | number, payload: CreateEventGuestPayload): Observable<ApiGuest> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/guests`;
    return this.http.post<{ success: boolean; data: { guest: ApiGuest } }>(url, payload, { headers }).pipe(
      map((resp) => resp?.data?.guest)
    );
  }

  // Cria convidados na pré-lista (lote)
  createEventGuestsBatch(idOrCode: string | number, guests: CreateGuestBatchItem[]): Observable<ApiGuest[]> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/guests`;
    const body = { guests };
    return this.http.post<GuestsApiResponse>(url, body, { headers }).pipe(
      map((resp) => resp?.data?.guests ?? [])
    );
  }

  // Check-in manual imediato
  checkinManual(idOrCode: string | number, payload: CheckinManualPayload): Observable<ApiGuest> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/checkin/manual`;
    return this.http.post<{ success: boolean; data: { guest: ApiGuest } }>(url, payload, { headers }).pipe(
      map((resp) => resp?.data?.guest)
    );
  }

  createEvent(payload: CreateEventPayload): Observable<EventListItem> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.post<EventCreateApiResponse>(`${this.API_BASE_URL}/events`, payload, { headers }).pipe(
      map((resp) => {
        const ev = resp?.data?.event || (resp?.data?.events ? resp.data!.events[0] : undefined);
        if (ev) return this.mapApiEventToListItem(ev);
        // fallback: mapeia a partir do payload enviado
        return {
          eventName: payload.name,
          description: payload.description || 'Sem descrição',
          startDate: this.formatDateTime(payload.start_datetime),
          endDate: this.formatDateTime(payload.end_datetime),
          image: this.normalizeImageUrl(payload.banner_url),
          links: []
        };
      })
    );
  }

  // Retorna o objeto bruto da API para obter id e id_code
  createEventRaw(payload: CreateEventPayload): Observable<ApiEvent> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.post<EventCreateApiResponse>(`${this.API_BASE_URL}/events`, payload, { headers }).pipe(
      map((resp) => (resp?.data?.event || (resp?.data?.events ? resp.data!.events[0] : undefined)) as ApiEvent)
    );
  }

  // Atualiza um evento por id numérico ou id_code string
  updateEvent(idOrCode: number | string, changes: Partial<ApiEvent>): Observable<ApiEvent> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    // Backend espera PATCH para atualizações parciais
    return this.http.patch<ApiEvent>(`${this.API_BASE_URL}/events/${idOrCode}`, changes, { headers });
  }

  // Busca detalhes de um evento por id_code público
  getEventByIdCode(idCode: string): Observable<ApiEvent> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.get<EventDetailApiResponse>(`${this.API_BASE_URL}/events/${idCode}`, { headers }).pipe(
      map((resp) => resp?.data?.event as ApiEvent)
    );
  }

  // Versão que retorna também total_responses (para KPIs)
  getEventByIdCodeDetail(idCode: string): Observable<{ event: ApiEvent; total_responses?: number }> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.get<EventDetailApiResponse>(`${this.API_BASE_URL}/events/${idCode}`, { headers }).pipe(
      map((resp) => ({ event: resp?.data?.event as ApiEvent, total_responses: resp?.data?.total_responses }))
    );
  }

  private mapApiEventToListItem(ev: ApiEvent): EventListItem {
    const eventName = ev.name || ev.title || 'Evento';
    const description = ev.description ?? ev.details ?? 'Sem descrição';

    const startIso = ev.start_datetime || ev.start_date || ev.startDate || '';
    const endIso = ev.end_datetime || ev.end_date || ev.endDate || '';
    const startDate = this.formatDateTime(startIso);
    const endDate = this.formatDateTime(endIso);

    const image = this.normalizeImageUrl(ev.banner_url || ev.image || undefined);

    // Links podem ser enriquecidos posteriormente quando a API disponibilizar URLs
    const links: Array<{ text: string; url: string; variant: 'primary' | 'outline' | 'info' | 'warning' }> = [];

    return { eventName, description, startDate, endDate, image: image || undefined, id_code: ev.id_code, links };
  }

  private formatDateTime(iso: string | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso; // caso venha num formato inesperado, mantém
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private normalizeImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    let clean = url.trim().replace(/[`'\"]/g, '');
    // Se vier apenas o nome do arquivo, assume pasta pública de cards
    if (!/^https?:\/\//.test(clean)) {
      // Evita duplicar caminho se já for relativo válido
      if (!clean.startsWith('/')) {
        clean = `/images/cards/${clean}`;
      }
      return clean;
    }
    return clean;
  }
}