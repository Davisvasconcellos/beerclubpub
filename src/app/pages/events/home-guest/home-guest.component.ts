import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  events: EventListItem[] = [];
  selectedEventIdCode = '';
  jams: ApiJam[] = [];
  plannedSongs: ApiSong[] = [];
  selections: Record<number, string | null> = {};
  lockDeadline: Record<number, number> = {};
  now: number = Date.now();
  tickHandle: any;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.tickHandle = setInterval(() => { this.now = Date.now(); }, 100);
    this.eventService.getEvents().subscribe({
      next: (items) => {
        this.events = items;
        if (this.events.length && !this.selectedEventIdCode) {
          this.selectedEventIdCode = this.events[0]?.id_code || '';
          this.onSelectEvent();
        }
      },
      error: () => { this.events = []; }
    });
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  onSelectEvent(): void {
    if (!this.selectedEventIdCode) { this.jams = []; this.plannedSongs = []; return; }
    this.eventService.getEventJams(this.selectedEventIdCode).subscribe({
      next: (jams) => {
        this.jams = jams || [];
        const songs = this.flattenSongsFromJams(this.jams);
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
}