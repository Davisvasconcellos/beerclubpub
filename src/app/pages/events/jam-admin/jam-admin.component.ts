import { Component, OnInit, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, EventListItem, ApiJam, ApiSong, InstrumentSlotPayload, OpenSongAggregate } from '../event.service';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';

type SongStatus = 'planned' | 'open_for_candidates' | 'on_stage' | 'played' | 'canceled';

@Component({
  selector: 'app-jam-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './jam-admin.component.html',
  styleUrl: './jam-admin.component.css'
})
export class JamAdminComponent implements OnInit {
  events: EventListItem[] = [];
  isLoadingEvents = false;

  selectedEventIdCode = '';
  createdJam: ApiJam | null = null;

  selectedJam: ApiJam | null = null;

  // Música
  songForm = {
    title: '',
    artist: '',
    key: '',
    bpm: 120 as number | null,
    notes: ''
  };

  instrumentChoices = [
    { key: 'vocals', label: 'Voz' },
    { key: 'guitar', label: 'Guitarra' },
    { key: 'bass', label: 'Baixo' },
    { key: 'keys', label: 'Teclado' },
    { key: 'drums', label: 'Bateria' },
    { key: 'horns', label: 'Metais' },
    { key: 'percussion', label: 'Percussão' },
    { key: 'strings', label: 'Cordas' },
    { key: 'other', label: 'Outro' },
  ];
  instrumentForm: Record<string, { enabled: boolean; slots: number }> = {
    vocals: { enabled: false, slots: 1 },
    guitar: { enabled: false, slots: 1 },
    bass: { enabled: false, slots: 1 },
    keys: { enabled: false, slots: 1 },
    drums: { enabled: false, slots: 1 },
    horns: { enabled: false, slots: 1 },
    percussion: { enabled: false, slots: 1 },
    strings: { enabled: false, slots: 1 },
    other: { enabled: false, slots: 1 },
  };

  // Lista local de músicas criadas
  songs: Array<ApiSong & { slots?: InstrumentSlotPayload[] }> = [];

  // SSE
  isSseConnected = false;
  private es: EventSource | null = null;

  constructor(
    private eventService: EventService,
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.isLoadingEvents = true;
    this.eventService.getEvents().subscribe({
      next: (items) => { this.events = items; this.isLoadingEvents = false; },
      error: () => { this.events = []; this.isLoadingEvents = false; }
    });
  }

  loadJamsForEvent(): void {
    if (!this.selectedEventIdCode) { this.selectedJam = null; this.songs = []; return; }
    this.eventService.getEventJams(this.selectedEventIdCode).subscribe({
      next: (items) => {
        const first = items && items.length ? items[0] : null;
        this.selectedJam = first;
        this.loadSongsForSelectedJam();
      },
      error: () => { this.selectedJam = null; this.songs = []; }
    });
  }

  

  insertSong(): void {
    if (!this.selectedEventIdCode) { this.triggerToast('error', 'Selecione o evento'); return; }
    const title = (this.songForm.title || '').trim();
    if (!title) { this.triggerToast('error', 'Título da música é obrigatório'); return; }
    const toggledSlots = Object.entries(this.instrumentForm)
      .filter(([_, v]) => v.enabled)
      .map(([k, v]) => ({ instrument: k, slots: Math.max(1, Number(v.slots) || 1) }));
    const payload = { title, artist: (this.songForm.artist || '').trim() || undefined, instrument_slots: toggledSlots };
    this.eventService.createSongAuto(this.selectedEventIdCode, payload).subscribe({
      next: (res) => {
        this.createdJam = res.jam;
        this.selectedJam = res.jam;
        const song = res.song;
        this.songs.unshift({ ...song, slots: toggledSlots as any });
        this.triggerToast('success', 'Música inserida', 'Jam atualizada automaticamente.');
        this.resetSongForm();
      },
      error: (err) => {
        const msg = (err?.error?.message || err?.message || 'Falha ao salvar música');
        this.triggerToast('error', 'Erro ao salvar música', msg);
      }
    });
  }

  private resetSongForm(): void {
    this.songForm = { title: '', artist: '', key: '', bpm: 120, notes: '' };
    Object.keys(this.instrumentForm).forEach(k => { this.instrumentForm[k].enabled = false; this.instrumentForm[k].slots = 1; });
  }

  

  // SSE (opcional): conecta e atualiza lista aberta
  toggleSse(): void {
    if (!this.createdJam || !this.selectedEventIdCode) return;
    if (this.isSseConnected) {
      this.disconnectSse();
      return;
    }
    this.es = this.eventService.streamJam(this.selectedEventIdCode, this.createdJam.id);
    this.isSseConnected = true;
    if (!this.es) return;
    this.es.onmessage = () => { this.refreshOpenSongs(); };
    this.es.onerror = () => { this.disconnectSse(); };
  }

  private disconnectSse(): void {
    if (this.es) { this.es.close(); this.es = null; }
    this.isSseConnected = false;
  }

  refreshOpenSongs(): void {
    if (!this.createdJam || !this.selectedEventIdCode) return;
    this.eventService.getOpenSongs(this.selectedEventIdCode, this.createdJam.id).subscribe({
      next: (items: OpenSongAggregate[]) => {
        const mapById = new Map<number, OpenSongAggregate>();
        items.forEach(s => mapById.set(s.id, s));
        this.songs = this.songs.map(s => {
          const updated = mapById.get(s.id);
          if (updated) {
            const status = (updated.status as SongStatus) || s.status || 'open_for_candidates';
            return { ...s, status, tempo_bpm: updated.tempo_bpm ?? s.tempo_bpm, slots: updated.slots as any };
          }
          return s;
        });
      },
      error: () => {}
    });
  }

  loadSongsForSelectedJam(): void {
    const jam = this.selectedJam;
    if (!jam || !this.selectedEventIdCode) { this.songs = []; return; }
    this.eventService.getJamSongs(this.selectedEventIdCode, jam.id).subscribe({
      next: (items) => { this.songs = items.map(s => ({ ...s, slots: (s as any).slots || [] })); },
      error: () => { this.songs = []; }
    });
  }

  getEventNameByCode(eventCode: string | undefined | null): string {
    if (!eventCode) return '';
    const ev = this.events.find(e => e.id_code === eventCode);
    return ev ? (ev.eventName || '') : '';
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
}