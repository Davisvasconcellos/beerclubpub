import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardColumnComponent } from '../../../shared/components/task/kanban/board-column/board-column.component';
import { Task } from '../../../shared/components/task/kanban/types/types';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { EventService, EventListItem, ApiJam, ApiSong } from '../event.service';
import { forkJoin, of } from 'rxjs';

type SongStatus = 'planned' | 'open_for_candidates' | 'on_stage' | 'played' | 'canceled';


@Component({
  selector: 'app-jam-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, BoardColumnComponent, DndModule, ModalComponent, LabelComponent, InputFieldComponent],
  templateUrl: './jam-kanban.component.html',
  styleUrl: './jam-kanban.component.css'
})
export class JamKanbanComponent implements OnInit {
  events: EventListItem[] = [];
  selectedEventIdCode = '';
  selectedJam: ApiJam | null = null;

  songs: ApiSong[] = [];
  tasks: Task[] = [];
  showAddModal = false;

  // Form nova música
  newSong = { title: '', artist: '' };
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

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({ next: (items) => this.events = items, error: () => this.events = [] });
  }

  onSelectEvent(): void {
    if (!this.selectedEventIdCode) { this.selectedJam = null; this.songs = []; this.tasks = []; return; }
    this.eventService.getEventJams(this.selectedEventIdCode).subscribe({
      next: (jams) => {
        this.selectedJam = jams && jams.length ? jams[0] : null;
        const jam = this.selectedJam as (ApiJam & { songs?: ApiSong[] }) | null;
        if (jam && Array.isArray(jam.songs) && jam.songs.length) {
          this.songs = jam.songs;
          this.tasks = jam.songs.map(s => ({ id: String(s.id), title: s.title, dueDate: '', assignee: '/images/user/user-01.jpg', status: (s.status as SongStatus) || 'planned', category: { name: 'Jam', color: 'default' }, expanded: false, song: s }));
        } else {
          this.loadSongs();
        }
      },
      error: () => { this.selectedJam = null; this.songs = []; this.tasks = []; }
    });
  }

  loadSongs(): void {
    const jam = this.selectedJam;
    if (!jam || !this.selectedEventIdCode) { this.songs = []; this.tasks = []; return; }
    this.eventService.getJamSongs(this.selectedEventIdCode, jam.id).subscribe({
      next: (items) => {
        this.songs = items;
        this.tasks = items.map(s => ({ id: String(s.id), title: s.title, dueDate: '', assignee: '/images/user/user-01.jpg', status: (s.status as SongStatus) || 'planned', category: { name: 'Jam', color: 'default' }, expanded: false, song: s }));
      },
      error: () => { this.songs = []; this.tasks = []; }
    });
  }

  get plannedTasks() { return this.tasks.filter(t => t.status === 'planned'); }
  get openTasks() { return this.tasks.filter(t => t.status === 'open_for_candidates'); }
  get onStageTasks() { return this.tasks.filter(t => t.status === 'on_stage'); }
  get playedTasks() { return this.tasks.filter(t => t.status === 'played'); }

  handleTaskDrop({ event, status }: { event: DndDropEvent, status: string }) {
    const dragged = event.data as Task;
    const songId = dragged.id;
    const jam = this.selectedJam;
    if (!jam) return;
    this.eventService.moveSongStatus(this.selectedEventIdCode, jam.id, songId, status as SongStatus).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map(t => t.id === songId ? { ...t, status: status as SongStatus } : t);
        if (status === 'on_stage') {
          const task = this.tasks.find(t => t.id === songId);
          const buckets = task?.song?.instrument_buckets || [];
          const rejects: any[] = [];
          for (const b of buckets as any[]) {
            const pend = Array.isArray(b?.pending) ? b.pending : [];
            for (const u of pend) {
              const cid = (u?.candidate_id ?? u?.application_id ?? u?.id ?? u?.user_id);
              if (cid !== undefined && cid !== null) {
                rejects.push(this.eventService.rejectSongCandidate(this.selectedEventIdCode, jam.id, songId, cid));
              }
            }
          }
          if (rejects.length) {
            forkJoin(rejects).subscribe({ next: () => {}, error: () => {} });
          }
        }
      },
      error: () => {
        // fallback: revert UI by reloading
        this.loadSongs();
      }
    });
  }

  openAddModal() { this.showAddModal = true; }
  closeAddModal() { this.showAddModal = false; }

  insertSong(): void {
    if (!this.selectedEventIdCode) return;
    const title = (this.newSong.title || '').trim();
    if (!title) return;
    const toggledSlots = Object.entries(this.instrumentForm)
      .filter(([_, v]) => v.enabled)
      .map(([k, v]) => ({ instrument: k, slots: Math.max(1, Number(v.slots) || 1) }));
    const payload = { title, artist: (this.newSong.artist || '').trim() || undefined, instrument_slots: toggledSlots };
    this.eventService.createSongAuto(this.selectedEventIdCode, payload).subscribe({
      next: (res) => {
        this.selectedJam = res.jam;
        const song = res.song;
        this.tasks.unshift({ id: String(song.id), title: song.title, dueDate: '', assignee: '/images/user/user-01.jpg', status: (song.status as SongStatus) || 'planned', category: { name: 'Jam', color: 'default' }, expanded: false, song });
        this.resetForm();
        this.closeAddModal();
      },
      error: () => {}
    });
  }

  resetForm(): void {
    this.newSong = { title: '', artist: '' };
    Object.keys(this.instrumentForm).forEach(k => { this.instrumentForm[k].enabled = false; this.instrumentForm[k].slots = 1; });
  }

  onTitleChange(val: string | number) { this.newSong.title = String(val || ''); }
  onArtistChange(val: string | number) { this.newSong.artist = String(val || ''); }

}
