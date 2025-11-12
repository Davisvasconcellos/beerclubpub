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
// Questions API Types
// ================================
export interface ApiQuestion {
  id: number;
  text?: string; // creation/update response may return `text`
  question_text?: string; // list response may return `question_text`
  type?: string; // creation/update may use `type`
  question_type?: string; // list may use `question_type`
  options?: string[];
  is_required?: boolean;
  show_results?: boolean;
  order_index?: number;
  is_public?: boolean | number;
  config?: any;
}

export interface QuestionsListApiResponse {
  success: boolean;
  data: { questions: ApiQuestion[] };
  message?: string;
}

export interface QuestionCreateApiResponse {
  success: boolean;
  data: { question: ApiQuestion };
  message?: string;
}

// Público: lista e detalhe com perguntas visíveis (show_results=true)
export interface PublicEventsListApiResponse {
  success: boolean;
  data: { events: ApiEvent[] };
  message?: string;
}

export interface PublicEventDetailWithQuestionsApiResponse {
  success: boolean;
  data: { event: ApiEvent & { questions?: ApiQuestion[] } };
  message?: string;
}

// ================================
// Responses API Types
// ================================
export interface AnswerItemPayload {
  question_id: number;
  answer_text?: string;
  answer_json?: any;
}

export interface SubmitResponsesPublicPayload {
  guest_code: string;
  selfie_url?: string;
  answers: AnswerItemPayload[];
}

export interface SubmitResponsesAuthPayload {
  selfie_url?: string;
  answers: AnswerItemPayload[];
}

export interface SubmitResponsesResult {
  success: boolean;
  response_id?: number;
  message?: string;
}

// Listagem de respostas
export interface ApiResponseItem {
  id: number;
  question_id: number;
  answer_text?: string | null;
  answer_json?: any;
  created_at?: string;
  // Informações do convidado/usuário (podem variar entre endpoints)
  user?: { id?: number; name?: string; display_name?: string; avatar_url?: string };
  guest_name?: string;
  guest_avatar_url?: string;
}

export interface ListResponsesApiResponse {
  success: boolean;
  data: { responses: ApiResponseItem[] };
  meta?: { total?: number };
  message?: string;
}

export interface ListResponsesParams {
  question_id?: number;
  page?: number;
  page_size?: number;
  search?: string;
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

  // ================================
  // Questions API Methods
  // ================================
  getEventQuestions(idOrCode: string | number): Observable<ApiQuestion[]> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/questions`;
    return this.http.get<QuestionsListApiResponse>(url, { headers }).pipe(
      map((resp) => (resp?.data?.questions ?? []).map((q) => this.normalizeQuestion(q)))
    );
  }

  // Público: lista eventos para obter slug
  getPublicEventsList(): Observable<ApiEvent[]> {
    const url = `${this.API_BASE_URL.replace('/api/v1', '')}/api/public/v1/events/public`;
    return this.http.get<PublicEventsListApiResponse>(url).pipe(
      map((resp) => resp?.data?.events ?? [])
    );
  }

  // Público: obter perguntas visíveis por slug
  getPublicEventQuestionsBySlug(slug: string): Observable<ApiQuestion[]> {
    const url = `${this.API_BASE_URL.replace('/api/v1', '')}/api/public/v1/events/public/${slug}`;
    return this.http.get<PublicEventDetailWithQuestionsApiResponse>(url).pipe(
      map((resp) => (resp?.data?.event?.questions ?? []).map((q) => this.normalizeQuestion(q)))
    );
  }

  createEventQuestion(idOrCode: string | number, payload: {
    text: string;
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating';
    options?: string[];
    is_required?: boolean;
    show_results?: boolean;
    order_index?: number;
    is_public?: boolean | number;
    config?: any;
  }): Observable<ApiQuestion> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/questions`;
    return this.http.post<QuestionCreateApiResponse>(url, payload, { headers }).pipe(
      map((resp) => this.normalizeQuestion(resp?.data?.question))
    );
  }

  updateEventQuestion(idOrCode: string | number, questionId: number, changes: Partial<{
    text: string;
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating';
    options: string[];
    is_required: boolean;
    show_results: boolean;
    order_index: number;
    is_public: boolean | number;
    config: any;
  }>): Observable<ApiQuestion> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/questions/${questionId}`;
    return this.http.patch<QuestionCreateApiResponse>(url, changes, { headers }).pipe(
      map((resp) => this.normalizeQuestion(resp?.data?.question))
    );
  }

  deleteEventQuestion(idOrCode: string | number, questionId: number): Observable<{ success: boolean; message?: string }>{
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = `${this.API_BASE_URL}/events/${idOrCode}/questions/${questionId}`;
    return this.http.delete<{ success: boolean; message?: string }>(url, { headers });
  }

  private normalizeQuestion(api: ApiQuestion | undefined): ApiQuestion {
    if (!api) return { id: 0, text: '', type: 'text', options: [], is_required: true, show_results: true, order_index: 0, is_public: 0 };
    const text = api.text ?? api.question_text ?? '';
    const rawType = api.type ?? api.question_type ?? 'text';
    // Mapear possíveis nomes alternativos vindos da API
    const type = ((): string => {
      const t = String(rawType).toLowerCase();
      if (['single', 'single_choice', 'radio'].includes(t)) return 'radio';
      if (['multiple', 'multiple_choice', 'checkbox', 'check'].includes(t)) return 'checkbox';
      if (['text_area', 'textarea'].includes(t)) return 'textarea';
      if (['rate', 'rating', 'stars'].includes(t)) return 'rating';
      return t || 'text';
    })();

    // Normalizar opções: aceitar array direto, JSON string ou CSV
    let options: string[] = [];
    const rawOpts: any = (api as any).options;
    if (Array.isArray(rawOpts)) {
      options = rawOpts.filter((o) => o != null).map((o) => String(o).trim()).filter(Boolean);
    } else if (typeof rawOpts === 'string') {
      const s = rawOpts.trim();
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            options = parsed.filter((o) => o != null).map((o) => String(o).trim()).filter(Boolean);
          }
        } catch {
          // CSV/pipe/semicolon/newline
          options = s.split(/[\n,;|]/).map((o) => o.trim()).filter(Boolean);
        }
      }
    }
    const rawPublic: any = (api as any).is_public;
    const is_public = typeof rawPublic === 'boolean' ? rawPublic : Number(rawPublic) === 1;
    return {
      id: api.id,
      text,
      type,
      options,
      is_required: api.is_required ?? true,
      show_results: api.show_results ?? true,
      order_index: api.order_index ?? 0,
      is_public,
      config: (api as any).config ?? undefined,
    };
  }

  // ================================
  // Responses API Methods
  // ================================
  getEventResponses(idOrCode: string | number, params?: ListResponsesParams): Observable<ApiResponseItem[]> {
    // Listagem de respostas é no namespace público, mesmo autenticado
    const headers: HttpHeaders = new HttpHeaders({});
    const base = `${this.API_BASE_URL.replace('/api/v1', '')}/api/public/v1/events/${idOrCode}/responses`;

    const query = new URLSearchParams();
    if (params?.question_id) query.set('question_id', String(params.question_id));
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.search) query.set('search', params.search);

    const url = `${base}${query.toString() ? `?${query.toString()}` : ''}`;
    return this.http.get<ListResponsesApiResponse>(url, { headers }).pipe(
      map((resp) => resp?.data?.responses ?? [])
    );
  }

  submitEventResponses(idOrCode: string | number, data: { guest_code?: string; selfie_url?: string; answers: AnswerItemPayload[] }): Observable<boolean> {
    const token = this.authService.getAuthToken();
    const headers: HttpHeaders = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = token
      ? `${this.API_BASE_URL}/events/${idOrCode}/responses`
      : `${this.API_BASE_URL.replace('/api/v1', '')}/api/public/v1/events/${idOrCode}/responses`;

    const body = token
      ? ({ selfie_url: data.selfie_url, answers: data.answers } as SubmitResponsesAuthPayload)
      : ({ guest_code: data.guest_code!, selfie_url: data.selfie_url, answers: data.answers } as SubmitResponsesPublicPayload);

    return this.http.post<SubmitResponsesResult>(url, body, { headers }).pipe(
      map((resp) => !!resp?.success)
    );
  }
}