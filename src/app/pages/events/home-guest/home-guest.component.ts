import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private eventService: EventService, private route: ActivatedRoute, private appRef: ApplicationRef, private injector: Injector, private envInjector: EnvironmentInjector, private authService: AuthService) {}

  ngOnInit(): void {
    this.tickHandle = setInterval(() => {
      this.now = Date.now();
      this.checkAndSubmitLockedSelections();
    }, 100);
    this.route.paramMap.subscribe(pm => {
      this.eventIdCode = pm.get('id_code') || '';
      if (this.eventIdCode) {
        this.eventService.getPublicEventByIdCodeDetail(this.eventIdCode).subscribe({
          next: (res) => { this.eventName = res?.event?.title || res?.event?.name || ''; },
          error: () => { this.eventName = ''; }
        });
        this.loadJams();
        this.loadOnStageOnce();
      } else {
        this.jams = [];
        this.plannedSongs = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  private loadJams(): void {
    if (!this.eventIdCode) { this.jams = []; this.plannedSongs = []; return; }
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
        this.plannedSongs = songs.filter(s => String((s as any)?.status) === 'open_for_candidates');
      },
      error: (err) => {
        this.jams = []; this.plannedSongs = [];
        const status = Number(err?.status || 0);
        if (status === 401) this.triggerToast('error', 'Acesso negado', 'Faça login para ver as músicas abertas.');
        else if (status === 403) this.triggerToast('error', 'Check-in necessário', 'Finalize o check-in no evento para ver as músicas.');
        else this.triggerToast('error', 'Erro ao carregar', 'Não foi possível listar as músicas abertas.');
      }
    });
  }

  private loadOnStageOnce(): void {
    if (!this.eventIdCode) { this.onStageSongs = []; return; }
    this.eventService.getEventMyOnStage(this.eventIdCode).subscribe({
      next: (songs: ApiSong[]) => {
        this.onStageSongs = Array.isArray(songs) ? songs : [];
      },
      error: (err) => {
        const status = Number(err?.status || 0);
        if (status === 401) this.onStageSongs = [];
        else if (status === 403) this.onStageSongs = [];
        else this.onStageSongs = [];
      }
    });
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
