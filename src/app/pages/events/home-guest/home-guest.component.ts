import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { CardTitleComponent } from '../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../shared/components/ui/card/card-description.component';
import { EventService, EventListItem, ApiJam, ApiSong } from '../event.service';

@Component({
  selector: 'app-home-guest',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardTitleComponent, CardDescriptionComponent],
  templateUrl: './home-guest.component.html',
  styleUrls: ['./home-guest.component.css']
})
export class HomeGuestComponent implements OnInit, OnDestroy {
  eventIdCode = '';
  jams: ApiJam[] = [];
  plannedSongs: ApiSong[] = [];
  selections: Record<number, string | null> = {};
  lockDeadline: Record<number, number> = {};
  submitted: Record<number, boolean> = {};
  attempting: Record<number, boolean> = {};
  now: number = Date.now();
  tickHandle: any;
  songJamMap: Record<number, number> = {};

  constructor(private eventService: EventService, private route: ActivatedRoute, private appRef: ApplicationRef, private injector: Injector, private envInjector: EnvironmentInjector) {}

  ngOnInit(): void {
    this.tickHandle = setInterval(() => {
      this.now = Date.now();
      this.checkAndSubmitLockedSelections();
    }, 100);
    this.route.paramMap.subscribe(pm => {
      this.eventIdCode = pm.get('id_code') || '';
      if (this.eventIdCode) {
        this.loadJams();
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
    this.eventService.getEventJams(this.eventIdCode).subscribe({
      next: (jams) => {
        this.jams = jams || [];
        const songs = this.flattenSongsFromJams(this.jams);
        // mapear song -> jam
        this.songJamMap = {};
        (this.jams || []).forEach(j => {
          const jsongs = Array.isArray(j.songs) ? (j.songs as ApiSong[]) : [];
          jsongs.forEach(s => { this.songJamMap[Number((s as any).id)] = Number(j.id); });
        });
        this.plannedSongs = songs.filter(s => (s.status as any) === 'open_for_candidates');
      },
      error: () => { this.jams = []; this.plannedSongs = []; }
    });
  }

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
    return Array.isArray(s.instrument_buckets) ? s.instrument_buckets : [];
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
          this.attempting[songId] = false;
          if (ok) this.triggerToast('success', 'Candidatura enviada', 'Sua candidatura foi enviada com sucesso.');
          else this.triggerToast('error', 'Falha ao enviar', 'Não foi possível enviar sua candidatura.');
        },
        error: (err) => {
          this.submitted[songId] = false;
          this.attempting[songId] = false;
          const msg = (err?.error?.message || err?.message || 'Erro ao enviar candidatura');
          this.triggerToast('error', 'Erro', msg);
        }
      });
    });
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
    try {
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
    } catch { /* noop */ }
  }
}
