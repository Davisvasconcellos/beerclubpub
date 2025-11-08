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
  // add any other fields from API as needed
}

export interface EventsApiResponse {
  success: boolean;
  message?: string;
  data: {
    events: ApiEvent[];
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
  links: Array<{ text: string; url: string; variant: 'primary' | 'outline' | 'info' | 'warning' }>;
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

    return { eventName, description, startDate, endDate, image: image || undefined, links };
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