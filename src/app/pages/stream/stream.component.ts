import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stream-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stream.component.html',
  styles: []
})
export class StreamComponent implements OnInit, OnDestroy {
  statusText = 'connecting...';
  messages: any[] = [];
  lastRaw = '';
  url = '';
  private es?: EventSource;
  private reconnectTimeout?: any;
  private fetchAbort?: AbortController;
  private lastEventAt = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.connect();
  }

  connect(): void {
    // Sempre usa URL absoluta do backend (evita proxy do dev server)
    this.url = `${environment.apiUrl}/api/stream-test`;

    // Fecha conexão anterior se existir
    if (this.es) {
      this.es.close();
    }

    // Cria nova conexão SSE
    this.es = new EventSource(this.url, { withCredentials: false });

    this.statusText = 'connecting...';

    // Conexão aberta com sucesso
    this.es.onopen = () => {
      this.statusText = 'connected - waiting for data';
      this.cdr.detectChanges();
      console.log('SSE conectado:', this.url);
      // Se não receber nenhuma mensagem em 5s, ativa fallback por fetch
      setTimeout(() => {
        if (this.messages.length === 0 && this.lastEventAt === 0) {
          this.startFetchFallback();
        }
      }, 5000);
    };

    // RECEBE OS DADOS AQUI — É OBRIGATÓRIO usar addEventListener para SSE puro
    this.es.addEventListener('message', (event: MessageEvent) => {
      const rawData = event.data;

      this.lastRaw = rawData;
      this.statusText = `received at ${new Date().toLocaleTimeString()}`;
      this.lastEventAt = Date.now();

      try {
        const parsed = JSON.parse(rawData);
        this.messages.unshift(parsed); // adiciona no topo
        if (this.messages.length > 50) {
          this.messages.pop(); // limita a 50 mensagens
        }
      } catch (e) {
        console.error('JSON inválido recebido:', rawData);
        this.messages.unshift({ error: 'JSON inválido', raw: rawData });
      }

      // Força detecção de mudanças (importante em alguns casos com SSE)
      this.cdr.detectChanges();
    });

    // Qualquer erro (rede, servidor caiu, CORS mal configurado, etc.)
    this.es.onerror = (ev) => {
      console.error('Erro no EventSource', ev);
      this.statusText = 'disconnected - reconnecting in 3s';

      if (this.es) {
        this.es.close();
        this.es = undefined;
      }

      // Reconecta automaticamente após 3 segundos
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);

      this.cdr.detectChanges();
    };
  }

  reconnect(): void {
    clearTimeout(this.reconnectTimeout);
    this.messages = [];
    this.lastRaw = '';
    this.connect();
  }

  ngOnDestroy(): void {
    clearTimeout(this.reconnectTimeout);
    if (this.es) {
      this.es.close();
    }
    try { this.fetchAbort?.abort(); } catch {}
  }

  private async startFetchFallback(): Promise<void> {
    try { this.es?.close(); } catch {}
    this.es = undefined;
    this.statusText = 'fallback stream via fetch';
    this.cdr.detectChanges();
    this.fetchAbort = new AbortController();
    const resp = await fetch(this.url, {
      signal: this.fetchAbort.signal,
      headers: { Accept: 'text/event-stream' },
      cache: 'no-store',
      mode: 'cors',
    });
    const reader = resp.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) return;
    let buffer = '';
    let currentEvent = { event: 'message', data: '' } as { event: string; data: string };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line === '') {
          const raw = currentEvent.data.trim();
          if (raw) {
            this.lastRaw = raw;
            this.statusText = `received at ${new Date().toLocaleTimeString()}`;
            this.lastEventAt = Date.now();
            try {
              const parsed = JSON.parse(raw);
              this.messages.unshift(parsed);
              if (this.messages.length > 50) this.messages.pop();
            } catch {
              this.messages.unshift({ error: 'JSON inválido', raw });
            }
            this.cdr.detectChanges();
          }
          currentEvent = { event: 'message', data: '' };
          continue;
        }
        if (line.startsWith(':')) continue; // comentário
        const idx = line.indexOf(':');
        const field = idx === -1 ? line : line.slice(0, idx);
        const valuePart = idx === -1 ? '' : line.slice(idx + 1).trimStart();
        if (field === 'event') currentEvent.event = valuePart || 'message';
        else if (field === 'data') currentEvent.data += valuePart + '\n';
      }
    }
  }
}
