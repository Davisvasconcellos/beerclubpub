import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../../shared/components/cards/event-card/event-card.component';
import { EventLinksModalComponent } from '../../../shared/components/modals/event-links-modal/event-links-modal.component';
import { AddEventModalComponent } from '../../../shared/components/modals/add-event-modal/add-event-modal/add-event-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, EventListItem, CreateEventPayload } from '../event.service';

export interface EventLink {
  text: string;
  url: string;
  variant: 'primary' | 'outline' | 'info' | 'warning';
}

type Event = EventListItem;

@Component({
  selector: 'app-event-list-admin',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    EventCardComponent,
    EventLinksModalComponent,
    AddEventModalComponent
  ],
  templateUrl: './event-list-admin.component.html',
  styleUrls: ['./event-list-admin.component.css'],
})
export class EventListAdminComponent implements OnInit {
  isModalOpen: boolean = false;
  isAddEventModalOpen: boolean = false; // New property for the add event modal
  selectedEventLinks: EventLink[] = [];
  events: Event[] = [];
  isLoading: boolean = false;
  loadError: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.isLoading = true;
    this.loadError = null;
    this.eventService.getEvents().subscribe({
      next: (items) => {
        this.events = items;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = (err?.message as string) || 'Falha ao carregar eventos.';
      }
    });
  }

  openAddEventModal() {
    this.isAddEventModalOpen = true;
  }

  closeAddEventModal() {
    this.isAddEventModalOpen = false;
  }

  onSaveNewEvent(payload: CreateEventPayload) {
    // Opcional: chamada à API para criar evento e atualizar lista
    this.eventService.createEvent(payload).subscribe({
      next: (created) => {
        this.events.unshift(created);
        this.isAddEventModalOpen = false;
      },
      error: (err) => {
        console.error('Falha ao criar evento', err);
        // fallback: adiciona localmente mesmo em erro
        const local: Event = {
          eventName: payload.name,
          description: payload.description || 'Sem descrição',
          startDate: new Date(payload.start_datetime).toLocaleString('pt-BR'),
          endDate: new Date(payload.end_datetime).toLocaleString('pt-BR'),
          image: payload.banner_url,
          links: []
        };
        this.events.unshift(local);
        this.isAddEventModalOpen = false;
      }
    });
  }

  onEditEvent(event: Event) {
    console.log('Editar evento:', event);
    // Implementar a lógica de edição aqui
  }

  openLinksModal(event: Event) {
    this.selectedEventLinks = event.links.filter(link => link.text === 'Links do Evento' || link.text === 'Galeria de Fotos');
    this.isModalOpen = true;
  }

  closeLinksModal() {
    this.isModalOpen = false;
    this.selectedEventLinks = [];
  }
}
