import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../../shared/components/cards/event-card/event-card.component';
import { EventLinksModalComponent } from '../../../shared/components/modals/event-links-modal/event-links-modal.component';
import { AddEventModalComponent } from '../../../shared/components/modals/add-event-modal/add-event-modal/add-event-modal.component';
import { TranslateModule } from '@ngx-translate/core';

export interface EventLink {
  text: string;
  url: string;
  variant: 'primary' | 'outline' | 'info' | 'warning';
}

interface Event {
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string; // Adicionando imagem opcional
  links: EventLink[];
}

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
export class EventListAdminComponent {
  isModalOpen: boolean = false;
  isAddEventModalOpen: boolean = false; // New property for the add event modal
  selectedEventLinks: EventLink[] = [];

  events: Event[] = [
    {
      eventName: 'Conferência de Tecnologia 2024',
      description: 'Explore as últimas tendências em inteligência artificial, blockchain e desenvolvimento de software. Participe de workshops interativos e faça networking com líderes da indústria.',
      startDate: '2024-10-26',
      endDate: '2024-10-28',
      links: [
        { text: 'Links do Evento', url: 'https://example.com/event1-link1', variant: 'info' },
        { text: 'Galeria de Fotos', url: 'https://example.com/event1-gallery', variant: 'info' },
        { text: 'Editar', url: '/events/edit/1', variant: 'warning' },
      ],
    },
    {
      eventName: 'Festival de Música VibeHood',
      description: 'Três dias de música ao vivo com artistas renomados e talentos emergentes. Desfrute de diversos gêneros musicais, food trucks e uma atmosfera vibrante.',
      startDate: '2024-11-15',
      endDate: '2024-11-17',
      links: [
        { text: 'Links do Evento', url: 'https://example.com/event2-link1', variant: 'info' },
        { text: 'Galeria de Fotos', url: 'https://example.com/event2-gallery', variant: 'info' },
        { text: 'Editar', url: '/events/edit/2', variant: 'warning' },
      ],
    },
    {
      eventName: 'Workshop de Culinária Gourmet',
      description: 'Aprenda técnicas de culinária avançadas com chefs premiados. Prepare pratos sofisticados e descubra os segredos da gastronomia.',
      startDate: '2024-12-01',
      endDate: '2024-12-01',
      links: [
        { text: 'Links do Evento', url: 'https://example.com/event3-link1', variant: 'primary' },
        { text: 'Galeria de Fotos', url: 'https://example.com/event3-gallery', variant: 'primary' },
        { text: 'Editar', url: '/events/edit/3', variant: 'warning' },
      ],
    },
    {
      eventName: 'Exposição de Arte Moderna',
      description: 'Uma coleção exclusiva de obras de arte contemporânea de artistas locais e internacionais. Uma experiência visual única para amantes da arte.',
      startDate: '2025-01-10',
      endDate: '2025-01-20',
      links: [
        { text: 'Links do Evento', url: 'https://example.com/event4-link1', variant: 'primary' },
        { text: 'Galeria de Fotos', url: 'https://example.com/event4-gallery', variant: 'primary' },
        { text: 'Editar', url: '/events/edit/4', variant: 'warning' },
      ],
    },
  ];

  openAddEventModal() {
    this.isAddEventModalOpen = true;
  }

  closeAddEventModal() {
    this.isAddEventModalOpen = false;
  }

  onSaveNewEvent(newEvent: { eventName: string; details: string; startDate: string; endDate: string; image: File | null }) {
    const eventToAdd: Event = {
      eventName: newEvent.eventName,
      description: newEvent.details,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      image: newEvent.image ? URL.createObjectURL(newEvent.image) : undefined, // Gerando URL temporária para preview
      links: [] // Inicializando com links vazios
    };
    this.events.push(eventToAdd);
    this.isAddEventModalOpen = false;
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
