import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { CardTitleComponent } from '../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../shared/components/ui/card/card-description.component';
import { ThemeToggleTwoComponent } from '../../../shared/components/common/theme-toggle-two/theme-toggle-two.component';
import { EventService, EventListItem, ApiJam, ApiSong } from '../event.service';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home-guest',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardTitleComponent, CardDescriptionComponent, ThemeToggleTwoComponent],
  templateUrl: './home-guest.component.html',
  styleUrls: ['./home-guest.component.css']
})
export class HomeGuestComponent implements OnInit, OnDestroy {
  eventIdCode = '';
  jams: ApiJam[] = [];
  plannedSongs: ApiSong[] = [];
  onStageSongs: ApiSong[] = [];
  selections: Record<number, string | null> = {};
  lockDeadline: Record<number, number> = {};
  submitted: Record<number, boolean> = {};
  attempting: Record<number, boolean> = {};
  submitError: Record<number, boolean> = {};
  approvedMap: Record<number, boolean> = {};
  myStatusMap: Record<number, string> = {};
  now: number = Date.now();
  tickHandle: any;
  songJamMap: Record<number, number> = {};
  eventName = '';
  esMap: Record<number, EventSource> = {};
  sseRefreshTimer: any;
  
  debugSse = true;
  sseOpenCount = 0;
  lastEventType = '';
  lastEventAt = 0;
  lastEventAtMap: Record<number, number> = {};
  sseStatusText = 'SSE 0 • - • -';
  pollingHandle: any;
  backoffUntilMs = 0;
  enablePolling = false;
  jamId: number | null = null;
  sseWatchdogHandle: any;
  enableWatchdog = false;

  constructor(private eventService: EventService, private route: ActivatedRoute, private appRef: ApplicationRef, private injector: Injector, private envInjector: EnvironmentInjector, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.tickHandle = setInterval(() => {
      this.now = Date.now();
      this.checkAndSubmitLockedSelections();
    }, 100);
    this.route.paramMap.subscribe(pm => {
      this.eventIdCode = pm.get('id_code') || '';
      if (!this.eventIdCode) {
        this.eventIdCode = this.route.snapshot.queryParamMap.get('id_code') || '';
      }
      try { console.log('[HomeGuest] init', { eventIdCode: this.eventIdCode }); } catch {}
      if (this.eventIdCode) {
        this.eventService.getPublicEventByIdCodeDetail(this.eventIdCode).subscribe({
          next: (res) => { this.eventName = res?.event?.title || res?.event?.name || ''; try { console.log('[HomeGuest] event detail loaded', { eventIdCode: this.eventIdCode, eventName: this.eventName }); } catch {} },
          error: () => { this.eventName = ''; }
        });
        this.eventService.getEventJamId(this.eventIdCode).subscribe({
          next: (jid) => { this.jamId = jid; try { console.log('[HomeGuest] jam id resolved', { eventIdCode: this.eventIdCode, jamId: this.jamId }); } catch {} this.ensureStreams(); },
          error: (err) => {
            const status = Number(err?.status || 0);
            if (status === 403 && this.eventIdCode) this.router.navigate([`/events/checkin/${this.eventIdCode}`], { queryParams: { returnUrl: `/events/home-guest/${this.eventIdCode}` } });
          }
        });
        this.loadJams();
        this.loadOnStageOnce();
      } else {
        this.jams = [];
        this.plannedSongs = [];
      }
      try {
        const sp = new URLSearchParams(String((window as any)?.location?.search || ''));
        this.debugSse = sp.get('debug') === '1' || this.debugSse;
        this.enablePolling = sp.get('poll') === '1' || sp.get('fallback') === '1';
      } catch {}
      if (this.enablePolling) this.startPolling();
      try {
        const sp2 = new URLSearchParams(String((window as any)?.location?.search || ''));
        this.enableWatchdog = sp2.get('watchdog') === '1';
      } catch {}
      if (this.enableWatchdog) this.startSseWatchdog();
      try {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) return;
          this.scheduleRefresh();
        });
      } catch {}
    });
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
    const ids = Object.keys(this.esMap);
    ids.forEach(id => {
      try { this.esMap[Number(id)].close(); } catch {}
      delete this.esMap[Number(id)];
    });
    if (this.sseRefreshTimer) clearTimeout(this.sseRefreshTimer);
    if (this.pollingHandle) clearInterval(this.pollingHandle);
    if (this.sseWatchdogHandle) clearInterval(this.sseWatchdogHandle);
  }

  private loadJams(): void {
    if (!this.eventIdCode) { this.jams = []; this.plannedSongs = []; return; }
    try { console.log('[HomeGuest] fetching open songs', { eventIdCode: this.eventIdCode }); } catch {}
    this.eventService.getEventOpenJamsSongs(this.eventIdCode).subscribe({
      next: (songs: ApiSong[]) => {
        this.songJamMap = {};
        songs.forEach((s: any) => {
          const sid = Number(s?.id);
          const jid = Number(s?.jam?.id ?? s?.jam_id);
          if (!Number.isNaN(sid) && !Number.isNaN(jid)) this.songJamMap[sid] = jid;
          const my = s?.my_application;
          if (my) {
            const instr = String(my.instrument || '');
            const status = String(my.status || 'pending');
            this.selections[sid] = instr || null;
            this.lockDeadline[sid] = this.now; // bloqueado
            this.submitted[sid] = true;
            this.submitError[sid] = status === 'rejected';
            this.approvedMap[sid] = status === 'approved';
            this.myStatusMap[sid] = status;
          }
        });
        this.plannedSongs = songs.filter(s => String((s as any)?.my_application?.status || '') !== 'rejected');
        try { console.log('[HomeGuest] open songs loaded', { count: this.plannedSongs.length, songIds: this.plannedSongs.map((x: any) => x?.id) }); } catch {}
        this.ensureStreams();
      },
      error: (err) => {
        this.jams = []; this.plannedSongs = [];
        const status = Number(err?.status || 0);
        if (status === 401) this.triggerToast('error', 'Acesso negado', 'Faça login para ver as músicas abertas.');
        else if (status === 403) {
          this.triggerToast('error', 'Check-in necessário', 'Finalize o check-in no evento para ver as músicas.');
          if (this.eventIdCode) this.router.navigate([`/events/checkin/${this.eventIdCode}`], { queryParams: { returnUrl: `/events/home-guest/${this.eventIdCode}` } });
        }
        else this.triggerToast('error', 'Erro ao carregar', 'Não foi possível listar as músicas abertas.');
      }
    });
  }

  private loadOnStageOnce(): void {
    if (!this.eventIdCode) { this.onStageSongs = []; return; }
    try { console.log('[HomeGuest] fetching my on-stage songs', { eventIdCode: this.eventIdCode }); } catch {}
    this.eventService.getEventMyOnStage(this.eventIdCode).subscribe({
      next: (songs: ApiSong[]) => {
        this.onStageSongs = Array.isArray(songs) ? songs : [];
        try { console.log('[HomeGuest] on-stage songs loaded', { count: this.onStageSongs.length, songIds: this.onStageSongs.map((x: any) => x?.id) }); } catch {}
        this.ensureStreams();
      },
      error: (err) => {
        const status = Number(err?.status || 0);
        if (status === 401) this.onStageSongs = [];
        else if (status === 403) {
          this.onStageSongs = [];
          if (this.eventIdCode) this.router.navigate([`/events/checkin/${this.eventIdCode}`], { queryParams: { returnUrl: `/events/home-guest/${this.eventIdCode}` } });
        }
        else this.onStageSongs = [];
      }
    });
  }


  private ensureStreams(): void {
    if (!this.eventIdCode) return;
    const idsFromOpen = Array.from(new Set(Object.values(this.songJamMap)));
    const idsFromStage = Array.from(new Set((this.onStageSongs || []).map(s => Number((s as any)?.jam?.id ?? (s as any)?.jam_id)).filter(n => !Number.isNaN(n))));
    const jamIds = Array.from(new Set([ ...idsFromOpen, ...idsFromStage, ...(this.jamId ? [this.jamId] : []) ]));
    try { console.log('[HomeGuest] ensureStreams', { eventIdCode: this.eventIdCode, jamIds, songJamMap: this.songJamMap }); } catch {}
    for (const jid of jamIds) {
      if (!jid || this.esMap[jid]) continue;
      const es = this.eventService.streamJam(this.eventIdCode, jid);
      if (this.debugSse) console.log('SSE connect', { eventId: this.eventIdCode, jamId: jid });
      es.onopen = () => {
        this.sseOpenCount = Object.keys(this.esMap).length;
        this.updateSseStatus();
        if (this.debugSse) console.log('SSE open', { jamId: jid });
      };
      const handleMessage = (ev: MessageEvent) => {
        try {
          if (this.debugSse) console.log('SSE raw', { jamId: jid, data: ev?.data });
          const data = JSON.parse(ev.data || '{}');
          const type = String(data?.type || data?.event || '');
          const payload = data?.payload || {};
          this.lastEventType = type || '';
          this.lastEventAt = Date.now();
          this.lastEventAtMap[jid] = this.lastEventAt;
          this.updateSseStatus();
          if (this.debugSse) console.log('SSE event', { jamId: jid, type, payload });
          this.scheduleRefresh();
        } catch {
          if (this.debugSse) console.log('SSE parse error', { jamId: jid, raw: ev?.data });
          this.scheduleRefresh();
        }
      };
      es.onmessage = handleMessage;
      try { (es as any).addEventListener && (es as any).addEventListener('message', handleMessage as any); } catch {}
      es.onerror = () => {
        if (this.debugSse) console.log('SSE error', { jamId: jid });
        this.updateSseStatus();
      };
      this.esMap[jid] = es;
    }
  }

  private scheduleRefresh(): void {
    if (this.sseRefreshTimer) clearTimeout(this.sseRefreshTimer);
    this.sseRefreshTimer = setTimeout(() => {
      this.refreshLists();
    }, 200);
  }

  private refreshLists(): void {
    if (!this.eventIdCode) return;
    this.eventService.getEventOpenJamsSongs(this.eventIdCode).subscribe({
      next: (songs: ApiSong[]) => {
        this.songJamMap = {};
        songs.forEach((s: any) => {
          const sid = Number(s?.id);
          const jid = Number(s?.jam?.id ?? s?.jam_id);
          if (!Number.isNaN(sid) && !Number.isNaN(jid)) this.songJamMap[sid] = jid;
        });
        this.plannedSongs = songs.filter(s => String((s as any)?.my_application?.status || '') !== 'rejected');
        if (this.debugSse) console.log('Refetch open', { count: this.plannedSongs.length, ids: this.plannedSongs.map((x: any) => x?.id) });
      },
      error: (err) => {
        const status = Number(err?.status || 0);
        if (status === 429) {
          this.backoffUntilMs = Date.now() + 45000;
          if (this.debugSse) console.log('Backoff open', { until: this.backoffUntilMs });
        }
        if (this.debugSse) console.log('Refetch open error', { status });
      }
    });
    this.eventService.getEventMyOnStage(this.eventIdCode).subscribe({
      next: (songs: ApiSong[]) => { this.onStageSongs = Array.isArray(songs) ? songs : []; if (this.debugSse) console.log('Refetch onStage', { count: this.onStageSongs.length, ids: this.onStageSongs.map((x: any) => x?.id) }); },
      error: (err) => {
        const status = Number(err?.status || 0);
        if (status === 429) {
          this.backoffUntilMs = Date.now() + 45000;
          if (this.debugSse) console.log('Backoff onStage', { until: this.backoffUntilMs });
        }
        if (this.debugSse) console.log('Refetch onStage error', { status });
      }
    });
  }

  private updateSseStatus(): void {
    const streams = Object.keys(this.esMap).length;
    const last = this.lastEventAt ? new Date(this.lastEventAt).toLocaleTimeString() : '-';
    const type = this.lastEventType || '-';
    this.sseStatusText = `SSE ${streams} • ${type} • ${last}`;
  }

  private startPolling(): void {
    if (this.pollingHandle) return;
    this.pollingHandle = setInterval(() => {
      if (typeof document !== 'undefined' && (document as any).hidden) return;
      if (this.backoffUntilMs && Date.now() < this.backoffUntilMs) return;
      this.refreshLists();
    }, 15000);
  }

  private startSseWatchdog(): void {
    if (this.sseWatchdogHandle) return;
    this.sseWatchdogHandle = setInterval(() => {
      const now = Date.now();
      const staleIds = Object.keys(this.esMap).map(Number).filter(jid => {
        const last = this.lastEventAtMap[jid] || 0;
        return !last || (now - last) > 30000; // 30s sem eventos
      });
      if (staleIds.length) {
        staleIds.forEach(jid => {
          try { this.esMap[jid].close(); } catch {}
          delete this.esMap[jid];
          if (this.debugSse) console.log('SSE watchdog reconnect', { jamId: jid });
        });
        this.ensureStreams();
      }
    }, 15000);
  }

  private isSongOnStageApprovedForMe(song: ApiSong): boolean {
    const s: any = song as any;
    const st = String(s?.status || '');
    if (st !== 'on_stage') return false;
    const me = this.authService.getCurrentUser();
    if (!me) return false;
    const myKeys = [me?.id, me?.id_code, me?.email].map(v => String((v ?? '') as any));
    const buckets: any[] = Array.isArray(s?.instrument_buckets) ? s.instrument_buckets : [];
    for (const b of buckets) {
      const approved = Array.isArray(b?.approved) ? b.approved : [];
      for (const u of approved) {
        const uKey = String(((u?.candidate_id ?? u?.id ?? u?.id_code ?? u?.user_id ?? u?.email) ?? '') as any);
        if (uKey && myKeys.includes(String(uKey))) return true;
      }
    }
    return false;
  }

  // removido: carregamento por jam, substituído por endpoint agregado

  private flattenSongsFromJams(jams: ApiJam[]): ApiSong[] {
    const acc: ApiSong[] = [];
    jams.forEach(j => {
      const jsongs = Array.isArray(j.songs) ? j.songs as ApiSong[] : [];
      jsongs.forEach(s => acc.push(s));
    });
    return acc;
  }

  getInstrumentBuckets(song: ApiSong): any[] {
    const s: any = song as any;
    if (Array.isArray(s.instrument_buckets)) return s.instrument_buckets;
    if (Array.isArray(s.instrument_slots)) {
      return s.instrument_slots.map((slot: any) => ({
        instrument: String(slot.instrument),
        slots: Number(slot.slots || 0),
        remaining: Number(
          slot?.remaining_slots ?? (
            Number(slot.slots || 0) - Number(slot.approved_count || 0)
          )
        )
      }));
    }
    const inst = Array.isArray(s.instrumentation) ? s.instrumentation : [];
    return inst.map((k: any) => ({ instrument: String(k), slots: 0, remaining: 0 }));
  }

  instrumentLabel(key: string): string {
    const map: any = { vocals: 'Voz', guitar: 'Guitarra', bass: 'Baixo', drums: 'Bateria', keys: 'Teclado', horns: 'Metais', percussion: 'Percussão', strings: 'Cordas', other: 'Outro' };
    return map[key] || key;
  }

  isRequested(songId: number, instrument: string): boolean {
    return (this.selections[songId] || null) === instrument;
  }

  toggleRequest(song: ApiSong, bucket: any): void {
    const songId = Number((song as any).id);
    const key = String(bucket.instrument);
    const deadline = this.lockDeadline[songId] || 0;
    if (deadline && this.now >= deadline) return;
    if (!deadline) this.lockDeadline[songId] = this.now + 5000;
    const current = this.selections[songId] || null;
    this.selections[songId] = current === key ? null : key;
    // reinicia submitted flag enquanto dentro da janela
    this.submitted[songId] = false;
  }

  getSongId(song: ApiSong): number {
    return Number((song as any).id);
  }

  iconForInstrument(key: string): string {
    const map: Record<string, string> = {
      vocals: '/images/icons/microfone.svg',
      guitar: '/images/icons/guitarra.svg',
      bass: '/images/icons/bass.svg',
      drums: '/images/icons/drums.svg',
      keys: '/images/icons/keyboard2.svg',
      violao: '/images/icons/violao.svg',
    };
    return map[key] || '/images/icons/violao.svg';
  }

  isLocked(songId: number): boolean {
    const d = this.lockDeadline[songId] || 0;
    return !!d && this.now >= d;
  }

  hasDeadline(songId: number): boolean {
    return !!this.lockDeadline[songId];
  }

  getRemainingPercent(songId: number): string {
    const d = this.lockDeadline[songId] || 0;
    if (!d) return '0%';
    const rem = Math.max(0, d - this.now);
    const pct = Math.max(0, Math.min(100, Math.round((rem / 5000) * 100)));
    return pct + '%';
  }

  private checkAndSubmitLockedSelections(): void {
    const ids = Object.keys(this.lockDeadline).map((k) => Number(k));
    ids.forEach((songId) => {
      const deadline = this.lockDeadline[songId] || 0;
      const sel = this.selections[songId] || null;
      if (!sel) return; // nada selecionado
      if (!deadline || this.now < deadline) return; // ainda dentro da janela
      if (this.submitted[songId] || this.attempting[songId]) return; // já enviado ou em andamento
      // marca tentativa imediatamente para evitar loop
      this.attempting[songId] = true;
      const jamId = this.songJamMap[songId];
      if (!jamId) return;
      // validação de instrumentos válidos
      const valid: Record<string, true> = { vocals: true, guitar: true, bass: true, drums: true, keys: true, horns: true, percussion: true, strings: true, other: true };
      if (!valid[sel]) { this.attempting[songId] = false; return; }
      this.eventService.applySongCandidate(this.eventIdCode, jamId, songId, sel).subscribe({
        next: (ok) => {
          this.submitted[songId] = !!ok;
          this.submitError[songId] = !ok;
          this.attempting[songId] = false;
          if (ok) {
            this.myStatusMap[songId] = 'pending';
            this.triggerToast('warning', 'Candidatura enviada', 'Sua candidatura foi registrada e aguarda aprovação.');
          }
          else this.triggerToast('error', 'Falha ao enviar', 'Não foi possível enviar sua candidatura.');
        },
        error: (err) => {
          const status = Number(err?.status || 0);
          if (status === 409) {
            this.submitted[songId] = true;
            this.submitError[songId] = false;
            this.myStatusMap[songId] = this.myStatusMap[songId] || 'pending';
            this.triggerToast('error', 'Já candidatado', 'Você já possui candidatura para esta música.');
          } else {
            this.submitted[songId] = false;
            this.submitError[songId] = true;
            const msg = (err?.error?.message || err?.message || 'Erro ao enviar candidatura');
            this.triggerToast('error', 'Erro', msg);
          }
          this.attempting[songId] = false;
        }
      });
    });
  }

  getCardBarClass(songId: number): string {
    const locked = this.isLocked(songId);
    const hasSel = !!this.selections[songId];
    const ok = !!this.submitted[songId];
    const err = !!this.submitError[songId];
    const approved = !!this.approvedMap[songId];
    if (hasSel && !locked) return 'bg-yellow-500 dark:bg-yellow-400';
    if (locked && ok && approved) return 'bg-green-500 dark:bg-green-400';
    if (locked && ok && !approved) return 'bg-yellow-500 dark:bg-yellow-400';
    if (locked && err) return 'bg-red-500 dark:bg-red-400';
    return 'bg-transparent';
  }
  private triggerToast(
    variant: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) {
    const compRef = createComponent(NotificationComponent, {
      environmentInjector: this.envInjector,
      elementInjector: this.injector,
    });
    compRef.setInput('variant', variant);
    compRef.setInput('title', title);
    compRef.setInput('description', description);
    compRef.setInput('hideDuration', 3000);
    this.appRef.attachView(compRef.hostView);
    const host = compRef.location.nativeElement as HTMLElement;
    host.style.position = 'fixed';
    host.style.top = '16px';
    host.style.right = '16px';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'auto';
    document.body.appendChild(host);
    setTimeout(() => {
      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
    }, 3200);
  }

  getBadge(song: ApiSong): { label: string; classes: string } {
    const id = this.getSongId(song);
    const base = 'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium';
    const my = this.myStatusMap[id] || '';
    const isOpen = String((song as any)?.status) === 'open_for_candidates';
    if (!isOpen) return { label: 'finished', classes: base + ' bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600' };
    if (!my) return { label: 'open', classes: base + ' bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-600/30 dark:text-blue-200 dark:border-blue-500/40' };
    if (my === 'pending') return { label: 'waiting', classes: base + ' bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-600/30 dark:text-yellow-200 dark:border-yellow-500/40' };
    if (my === 'approved') return { label: 'finished', classes: base + ' bg-green-100 text-green-700 border-green-200 dark:bg-green-600/30 dark:text-green-200 dark:border-green-500/40' };
    if (my === 'rejected') return { label: 'finished', classes: base + ' bg-red-100 text-red-700 border-red-200 dark:bg-red-600/30 dark:text-red-200 dark:border-red-500/40' };
    return { label: 'open', classes: base + ' bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-600/30 dark:text-blue-200 dark:border-blue-500/40' };
  }
}
