import { Component, OnInit, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexXAxis, ApexLegend, ApexYAxis } from 'ng-apexcharts';
import { PaginationWithIconComponent } from '../../../shared/components/tables/data-tables/table-one/pagination-with-icon/pagination-with-icon.component';
import { GuestCardModalComponent } from '../../../shared/components/modals/guest-card-modal/guest-card-modal.component';
import { EditGuestModalComponent } from '../../../shared/components/modals/edit-guest-modal/edit-guest-modal.component';
import { AddGuestModalComponent } from '../../../shared/components/modals/add-guest-modal/add-guest-modal.component';
import { NewGuestInput } from '../../../shared/components/modals/add-guest-modal/add-guest-modal.component';
import { CardSettingsComponent, CardSettings } from '../../../shared/components/cards/card-settings/card-settings.component';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { Guest } from '../../../shared/interfaces/guest.interface';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, ApiEvent, ApiGuest } from '../event.service';
import { ImageUploadService } from '../../../shared/services/image-upload.service';

interface TableRowData {
  id: number;
  user: { image: string | undefined; name: string };
  email: string;
  phone: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  documentNumber?: string;
  guestType?: string;
  rsvp?: boolean;
  rsvpAt?: string | null;
  checkin?: boolean;
  checkinAt?: string | null;
}

interface EventData {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  slug?: string;
  respName?: string;
  respEmail?: string;
  respPhone?: string;
  primaryColor: string;
  secondaryColor: string;
  showLogo: boolean;
  showQRCode: boolean;
  image: string;
  cardBackgroundType: 'gradient' | 'image';
  cardBackgroundImage?: string;
}

// Tipos para perguntas e respostas
type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'poll';

interface AnswerItem {
  user: { id: number; image: string; name: string };
  value: string | string[];
}

interface QuestionItem {
  id: number;
  title: string;
  type: QuestionType;
  answers: AnswerItem[];
}

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgApexchartsModule, PaginationWithIconComponent, GuestCardModalComponent, EditGuestModalComponent, AddGuestModalComponent, CardSettingsComponent],
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.css'
})
  export class EventViewComponent implements OnInit {
    activeTab: string = 'detalhes';
    private eventIdCode?: string;
    isEventLoading: boolean = true;
    private imageFile?: File;
    private imageDirty: boolean = false;
    private bannerOriginalUrl?: string;
    private cardImageFile?: File;
    private cardImageDirty: boolean = false;
    private cardBackgroundOriginalUrl?: string;

  event: EventData = {
    id: 1,
    name: 'Festival de Música Vibehood',
    description: 'Três dias de música ao vivo com artistas renomados e talentos emergentes. Desfrute de diversos gêneros musicais, food trucks e uma atmosfera vibrante.',
    location: 'Parque Central da Cidade',
    startDate: '2024-06-15',
    endDate: '2024-06-17',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    showLogo: true,
    showQRCode: true,
    image: '/images/cards/event2.jpg',
    cardBackgroundType: 'image',
    cardBackgroundImage: '/images/cards/event3.jpg'
  }

  // Configurações do cartão
  cardSettings: CardSettings = {
    backgroundType: 'image',
    backgroundImage: '/images/cards/event4.jpg',
    primaryColor: this.event.primaryColor,
    secondaryColor: this.event.secondaryColor,
    showLogo: this.event.showLogo,
    showQRCode: this.event.showQRCode
  };

  // Métodos do DataTable
  get filteredAndSortedData() {
    return this.tableData
      .filter((item) =>
        ((item.user?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        ((item.email || '').toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        ((item.phone || '').toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (item.guestType?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
        (item.documentNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false)
      )
      .sort((a, b) => {
        let valueA: any, valueB: any;

        if (this.sortKey === 'name') {
          valueA = a.user?.name || '';
          valueB = b.user?.name || '';
        } else {
          valueA = a[this.sortKey as keyof TableRowData];
          valueB = b[this.sortKey as keyof TableRowData];
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return this.sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });
  }

  get totalItems() {
    return this.filteredAndSortedData.length;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  get currentData() {
    return this.filteredAndSortedData.slice(this.startIndex, this.endIndex);
  }

  handlePageChange(page: number) {
    this.currentPage = page;
  }

  handleSort(key: string) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  };

  // Dados dos convidados adaptados para o DataTable
  tableData: TableRowData[] = [];

  guests: Guest[] = [];

  // Modal properties
  isGuestCardModalOpen = false;
  isEditGuestModalOpen = false;
  isAddGuestModalOpen = false;
  selectedGuest: Guest | null = null;

  // Event data for modal
  eventData = {
    id: 1,
    name: this.event.name,
    description: this.event.description,
    location: this.event.location,
    startDate: this.event.startDate,
    endDate: this.event.endDate,
    primaryColor: this.event.primaryColor,
    secondaryColor: this.event.secondaryColor,
    showLogo: this.event.showLogo,
    showQRCode: this.event.showQRCode,
    image: this.event.image,
    cardBackgroundType: this.event.cardBackgroundType,
    cardBackgroundImage: this.event.cardBackgroundImage
  };

  // Propriedades do DataTable
  columns = [
    { key: 'name', label: 'Convidado' },
    { key: 'phone', label: 'Telefone' },
    { key: 'guestType', label: 'Tipo de convidado' },
    { key: 'rsvp', label: 'RSVP' },
    { key: 'checkin', label: 'Check-in' },
    { key: 'actions', label: 'Ações' }
  ];

  // Colunas para mobile (combinadas)
  mobileColumns = [
    { key: 'guest-info', label: 'Informações do Convidado' },
    { key: 'actions', label: 'Ações' }
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortKey: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  isSaving: boolean = false;
  saveMessage: string = '';
  saveError: string = '';

  // Toast state
  showToast: boolean = false;
  toastVariant: 'success' | 'info' | 'warning' | 'error' = 'success';
  toastTitle: string = '';
  toastDescription?: string;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const idCode = pm.get('id_code');
      if (idCode) {
        this.resetEventState();
        this.eventIdCode = idCode;
        this.loadEvent(idCode);
        this.loadGuests(idCode);
      }
    });
  }

  openAddGuestModal() {
    this.isAddGuestModalOpen = true;
  }

  closeAddGuestModal() {
    this.isAddGuestModalOpen = false;
  }

  saveNewGuest(newGuest: NewGuestInput) {
    const nextId = (this.tableData.length ? Math.max(...this.tableData.map(t => t.id)) : 0) + 1;

    const guest: Guest = {
      id: nextId,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone,
      image: undefined,
      status: newGuest.checkin ? 'Confirmado' : 'Pendente'
    };

    // Atualiza lista de convidados base
    this.guests = [guest, ...this.guests];

    // Atualiza dados da tabela
    const row: TableRowData = {
      id: nextId,
      user: { image: guest.image, name: guest.name },
      email: guest.email,
      phone: guest.phone,
      status: guest.status,
      documentNumber: newGuest.documentNumber || '',
      guestType: '',
      rsvp: false,
      checkin: !!newGuest.checkin
    };
    this.tableData = [row, ...this.tableData];

    this.isAddGuestModalOpen = false;
    this.triggerToast('success', 'Convidado adicionado', 'Convidado inserido na lista de convidados.');
  }

  private resetEventState() {
    this.isEventLoading = true;
    this.event = {
      id: 0,
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      slug: '',
      respName: '',
      respEmail: '',
      respPhone: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      showLogo: true,
      showQRCode: true,
      image: '/images/cards/event2.jpg',
      cardBackgroundType: 'image',
      cardBackgroundImage: '/images/cards/event3.jpg'
    };
    this.cardSettings = {
      backgroundType: 'image',
      backgroundImage: '/images/cards/event4.jpg',
      primaryColor: this.event.primaryColor,
      secondaryColor: this.event.secondaryColor,
      showLogo: this.event.showLogo,
      showQRCode: this.event.showQRCode
    };
    this.guests = [];
  }

  private loadEvent(idCode: string) {
    this.eventService.getEventByIdCode(idCode).subscribe({
      next: (ev: ApiEvent) => {
        const name = ev.name || ev.title || '';
        const description = ev.description ?? ev.details ?? '';
        const startIso = ev.start_datetime || ev.start_date || ev.startDate || '';
        const endIso = ev.end_datetime || ev.end_date || ev.endDate || '';
        const banner = this.normalizeImageUrl(ev.banner_url || ev.image || undefined) || '/images/cards/event2.jpg';
        const place = (ev as any).place || '';
        const color1 = (ev as any).color_1 || '#3B82F6';
        const color2 = (ev as any).color_2 || '#1E40AF';
        const cardBgRaw = (ev as any).card_background || this.event.cardBackgroundImage || '/images/cards/event3.jpg';
        const cardBg = this.normalizeImageUrl(cardBgRaw) || cardBgRaw;
        const slug = (ev as any).slug || '';
        const respName = (ev as any).resp_name || '';
        const respEmail = (ev as any).resp_email || '';
        const respPhone = (ev as any).resp_phone || '';
        const id_code = (ev as any).id_code || idCode;

        this.event = {
          id: Number(ev.id) || 0,
          name,
          description,
          location: (place || '').trim(),
          startDate: this.toLocalDateTime(startIso),
          endDate: this.toLocalDateTime(endIso),
          slug,
          respName,
          respEmail,
          respPhone,
          primaryColor: color1,
          secondaryColor: color2,
          showLogo: true,
          showQRCode: true,
          image: banner,
          cardBackgroundType: 'image',
          cardBackgroundImage: cardBg
        };
        this.eventIdCode = id_code;
        this.bannerOriginalUrl = (ev.banner_url || ev.image || undefined) || undefined;
        this.cardBackgroundOriginalUrl = (ev as any).card_background || undefined;

        this.cardSettings = {
          backgroundType: 'image',
          backgroundImage: cardBg,
          primaryColor: color1,
          secondaryColor: color2,
          showLogo: true,
          showQRCode: true
        };
        this.isEventLoading = false;
      },
      error: (err) => {
        this.isEventLoading = false;
        const msg = (err?.error?.message || err?.message || 'Falha ao carregar evento');
        this.triggerToast('error', 'Erro ao carregar evento', msg);
      }
    });
  }

  private loadGuests(idCode: string) {
    this.eventService.getEventGuests(idCode, { page: 1, page_size: 20 }).subscribe({
      next: (guests: ApiGuest[]) => {
        // Mapear para o modelo Guest usado no componente
        this.guests = guests.map(g => ({
          id: g.id,
          name: g.display_name,
          email: g.email,
          phone: g.phone || '',
          image: this.normalizeImageUrl(g.avatar_url || undefined),
          status: g.checkin ? 'Confirmado' : 'Pendente'
        }));

        // Atualizar dados da tabela para DataTables
        this.tableData = this.guests.map(guest => {
          const g = guests.find(gg => gg.id === guest.id);
          return {
            id: guest.id,
            user: { image: guest.image, name: guest.name },
            email: guest.email,
            phone: guest.phone,
            status: guest.status,
            documentNumber: g?.document?.number || '',
            guestType: g?.type || '',
            rsvp: !!(g?.rsvp),
            rsvpAt: g?.rsvp_at ?? null,
            checkin: !!(g?.checkin),
            checkinAt: g?.checkin ?? null
          } as TableRowData;
        });
      },
      error: (err) => {
        console.error('Falha ao carregar convidados', err);
      }
    });
  }

  private toLocalDateTime(iso: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      // Caso venha já no formato correto ou outro, retorna como está
      return iso;
    }
  }

  toLocalTime(iso?: string | null): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return String(iso);
    }
  }

  toggleRsvp(row: TableRowData) {
    const newVal = !row.rsvp;
    // Apenas alterna o estado; mantém rsvpAt como valor do banco
    this.tableData = this.tableData.map(r => r.id === row.id ? { ...r, rsvp: newVal } : r);
  }

  toggleCheckin(row: TableRowData) {
    const newVal = !row.checkin;
    // Apenas alterna o estado; mantém checkinAt como valor do banco
    this.tableData = this.tableData.map(r => r.id === row.id ? { ...r, checkin: newVal } : r);
  }

  private normalizeImageUrl(url?: string | null): string | undefined {
    const clean = (url || '').trim();
    if (!clean) return undefined;
    if (/^https?:\/\//.test(clean)) return clean;
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      this.imageDirty = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.event.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onDateChange(field: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const newDate = target.value;
    const startD = this.parseLocalDate(this.event.startDate);
    const endD = this.parseLocalDate(this.event.endDate);
    const newD = this.parseLocalDate(newDate);

    if (field === 'start') {
      // Se a data de início mudou e é maior que a data de fim, limpar a data de fim
      if (endD && newD && newD.getTime() > endD.getTime()) {
        this.event.endDate = '';
      }
      this.event.startDate = newDate;
    } else if (field === 'end') {
      // Se a data de fim é menor que a data de início, ajustar para a data de início
      if (startD && newD && newD.getTime() < startD.getTime()) {
        this.event.endDate = this.event.startDate;
        target.value = this.event.startDate;
        return;
      }
      this.event.endDate = newDate;
    }
  }

  saveEvent() {
    this.isSaving = true;
    this.saveMessage = '';
    this.saveError = '';

    if (!this.isDetailsValid()) {
      this.isSaving = false;
      this.saveError = 'Preencha os campos obrigatórios: nome, descrição, datas e local.';
      return;
    }

    const name = (this.event.name || '').trim();
    const description = (this.event.description || '').trim();
    const startIso = this.toIsoZ(this.event.startDate);
    const endIso = this.toIsoZ(this.event.endDate);
    const place = (this.event.location || '').trim();
    const respEmail = (this.event.respEmail || '').trim();
    const respName = (this.event.respName || '').trim();
    const respPhone = (this.event.respPhone || '').trim();
    const color_1 = this.cardSettings.primaryColor || this.event.primaryColor;
    const color_2 = this.cardSettings.secondaryColor || this.event.secondaryColor;
    let card_background: string | undefined;
    if (this.cardSettings.backgroundType === 'image') {
      // Se a imagem do cartão está "suja" (alterada), não enviar card_background no primeiro POST
      if (!this.cardImageDirty) {
        const bg = this.cardSettings.backgroundImage || this.event.cardBackgroundImage || '';
        // Envia URL absoluta para o backend
        card_background = bg ? this.normalizeBannerUrl(bg) : '';
      }
    } else {
      // Para gradiente, enviar string vazia para limpar o background de imagem
      card_background = '';
    }
    const slug = this.slugify(name);

    const changes: Partial<ApiEvent> & {
      place?: string;
      resp_email?: string;
      resp_name?: string;
      resp_phone?: string;
      color_1?: string;
      color_2?: string;
      card_background?: string | null;
    } = {
      name,
      description,
      start_datetime: startIso,
      end_datetime: endIso,
      slug,
      place,
      resp_email: respEmail,
      resp_name: respName,
      resp_phone: respPhone,
      color_1,
      color_2
    };

    // Enviar card_background somente quando definido (evita enviar null quando sujo)
    if (card_background !== undefined) {
      changes.card_background = card_background;
    }

    const idOrCode = this.eventIdCode || this.event.id;
    this.eventService.updateEvent(idOrCode, changes).subscribe({
      next: async () => {
        // Se a imagem foi alterada, fazer upload e atualizar banner_url em seguida
        if (this.imageDirty && this.imageFile && this.eventIdCode) {
          try {
            const result = await this.imageUploadService.uploadImage(
              this.imageFile,
              'event-banner',
              this.eventIdCode,
              { maxWidth: 1200, maxHeight: 630, quality: 0.85 }
            );

            if (result.success && result.filePath) {
              const bannerFullUrl = this.normalizeBannerUrl(result.filePath);
              await new Promise<void>((resolve, reject) => {
                this.eventService.updateEvent(idOrCode, { banner_url: bannerFullUrl }).subscribe({
                  next: () => resolve(),
                  error: (err) => reject(err)
                });
              });

              this.event.image = result.filePath;
              this.imageDirty = false;
              this.triggerToast('success', 'Atualização realizada', 'Evento e imagem atualizados com sucesso.');
            } else {
              this.triggerToast('warning', 'Imagem não atualizada', result.error || 'Falha no upload da imagem. O banner antigo foi mantido.');
              if (this.bannerOriginalUrl) {
                this.event.image = this.normalizeImageUrl(this.bannerOriginalUrl) || this.event.image;
              }
            }
          } catch (error) {
            console.error('Erro ao enviar imagem do evento:', error);
            this.triggerToast('error', 'Falha ao atualizar imagem', 'Erro ao enviar a nova imagem. O banner antigo foi mantido.');
            if (this.bannerOriginalUrl) {
              this.event.image = this.normalizeImageUrl(this.bannerOriginalUrl) || this.event.image;
            }
          }
        } else {
          this.triggerToast('success', 'Atualização realizada', 'Evento atualizado com sucesso.');
        }

        // Se a imagem do cartão foi alterada, fazer upload e atualizar card_background em seguida
        if (this.cardImageDirty && this.cardImageFile && this.eventIdCode) {
          try {
            const result = await this.imageUploadService.uploadImage(
              this.cardImageFile,
              'event-card',
              this.eventIdCode,
              { maxWidth: 800, maxHeight: 1200, quality: 0.9 }
            );

            if (result.success && result.filePath) {
              const cardFullUrl = this.normalizeBannerUrl(result.filePath);
              await new Promise<void>((resolve, reject) => {
                this.eventService.updateEvent(idOrCode, { card_background: cardFullUrl } as any).subscribe({
                  next: () => resolve(),
                  error: (err) => reject(err)
                });
              });

              const newUrl = this.normalizeImageUrl(result.filePath) || result.filePath;
              this.cardSettings = { ...this.cardSettings, backgroundImage: newUrl };
              this.event.cardBackgroundImage = newUrl;
              this.cardImageDirty = false;
            } else {
              this.triggerToast('warning', 'Imagem do cartão não atualizada', result.error || 'Falha no upload da imagem. O fundo antigo foi mantido.');
              if (this.cardBackgroundOriginalUrl) {
                const original = this.normalizeImageUrl(this.cardBackgroundOriginalUrl) || this.event.cardBackgroundImage;
                this.cardSettings = { ...this.cardSettings, backgroundImage: original };
                this.event.cardBackgroundImage = original;
              }
            }
          } catch (error) {
            console.error('Erro ao enviar imagem do cartão:', error);
            this.triggerToast('error', 'Falha ao atualizar imagem do cartão', 'Erro ao enviar a nova imagem. O fundo antigo foi mantido.');
            if (this.cardBackgroundOriginalUrl) {
              const original = this.normalizeImageUrl(this.cardBackgroundOriginalUrl) || this.event.cardBackgroundImage;
              this.cardSettings = { ...this.cardSettings, backgroundImage: original };
              this.event.cardBackgroundImage = original;
            }
          }
        }

        this.isSaving = false;
        this.saveMessage = '';
      },
      error: (err) => {
        console.error('Erro ao atualizar evento:', err);
        this.isSaving = false;
        this.saveError = '';
        this.triggerToast('error', 'Falha na atualização', 'Erro ao atualizar evento. Tente novamente.');
      }
    });
  }

  exportGuestList() {
    // Preparar dados para exportação
    const csvData = this.filteredAndSortedData.map(item => ({
      'Nome': item.user.name,
      'Email': item.email,
      'Telefone': item.phone
    }));

    // Converter para CSV
    const csvContent = this.convertToCSV(csvData);

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lista-convidados-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Adicionar cabeçalhos
    csvRows.push(headers.join(','));

    // Adicionar dados
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar aspas duplas e envolver em aspas se necessário
        return typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  // Método para trackBy na lista de convidados
  trackByGuestId(index: number, item: TableRowData): number {
    return item.id;
  }

  // Métodos para ações dos convidados
  viewGuest(item: TableRowData) {
    // Encontrar o guest correspondente pelo ID
    const guest = this.guests.find(g => g.id === item.id);
    if (guest) {
      this.selectedGuest = guest;
      this.isGuestCardModalOpen = true;
    }
  }

  closeGuestCardModal() {
    this.isGuestCardModalOpen = false;
    this.selectedGuest = null;
  }

  editGuest(item: TableRowData) {
    // Encontrar o guest correspondente pelo ID
    const guest = this.guests.find(g => g.id === item.id);
    if (guest) {
      this.selectedGuest = guest;
      this.isEditGuestModalOpen = true;
    }
  }

  // Métodos para o modal de edição
  closeEditGuestModal() {
    this.isEditGuestModalOpen = false;
    this.selectedGuest = null;
  }

  saveGuestChanges(updatedGuest: Guest) {
    // Encontrar o índice do convidado na lista
    const index = this.guests.findIndex(g => g.id === updatedGuest.id);
    if (index !== -1) {
      // Atualizar o convidado na lista
      this.guests[index] = updatedGuest;

      // Atualizar também os dados da tabela
      const tableIndex = this.tableData.findIndex(t => t.id === updatedGuest.id);
      if (tableIndex !== -1) {
        this.tableData[tableIndex] = {
          id: updatedGuest.id,
          user: {
            image: updatedGuest.image,
            name: updatedGuest.name
          },
          email: updatedGuest.email,
          phone: updatedGuest.phone,
          status: updatedGuest.status
        };
      }
    }

    // Fechar o modal
    this.closeEditGuestModal();
  }

  // Métodos para configurações do cartão
  onCardSettingsChange(settings: any) {
    this.cardSettings = { ...settings };
  }

  getCardBackground(): string {
    if (this.cardSettings.backgroundType === 'image' && this.cardSettings.backgroundImage) {
      return `url(${this.cardSettings.backgroundImage})`;
    } else {
      return `linear-gradient(135deg, ${this.cardSettings.primaryColor} 0%, ${this.cardSettings.secondaryColor} 100%)`;
    }
  }

  onCardBackgroundFileChange(file: File | null) {
    this.cardImageFile = file ?? undefined;
    this.cardImageDirty = !!file;
  }

  // Salvar configurações do cartão
  saveCardSettings() {
    this.saveEvent();
  }

  private slugify(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  private toIsoZ(localValue: string | undefined): string {
    if (!localValue) return '';
    const parsed = this.parseLocalDate(localValue);
    if (!parsed) return localValue;
    return parsed.toISOString();
  }

  private parseLocalDate(value?: string): Date | null {
    if (!value) return null;
    // Esperado: YYYY-MM-DDTHH:MM (datetime-local)
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(value);
    if (m) {
      const [_, y, mo, d, h, mi] = m;
      const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), 0, 0);
      return dt;
    }
    // Fallback para formatos parseáveis pelo Date
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private normalizeBannerUrl(url: string): string {
    const clean = (url || '').trim();
    if (!clean) return '';
    if (/^https?:\/\//.test(clean)) return clean;
    const base = (typeof window !== 'undefined' && (window as any).location?.origin) ? (window as any).location.origin : '';
    const relative = clean.startsWith('/') ? clean : `/images/cards/${clean}`;
    return base ? `${base}${relative}` : relative;
  }

  isDetailsValid(): boolean {
    const nameOk = !!(this.event.name && this.event.name.trim());
    const descOk = !!(this.event.description && this.event.description.trim());
    const startOk = !!(this.event.startDate && this.event.startDate.trim());
    const endOk = !!(this.event.endDate && this.event.endDate.trim());
    const locOk = !!(this.event.location && this.event.location.trim());
    return nameOk && descOk && startOk && endOk && locOk;
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

  // -----------------
  // Respostas por pergunta
  // -----------------

  questions: QuestionItem[] = [
    {
      id: 101,
      title: 'Qual foi sua experiência no evento? (texto aberto)',
      type: 'text',
      answers: [
        { user: { id: 1, image: '/images/user/user-20.jpg', name: 'João Silva' }, value: 'Excelente, organização impecável!' },
        { user: { id: 2, image: '/images/user/user-21.jpg', name: 'Maria Santos' }, value: 'Gostei muito, mas faltou água nos banheiros.' }
      ]
    },
    {
      id: 102,
      title: 'Qual atração você mais gostou? (múltipla escolha - uma resposta)',
      type: 'single_choice',
      answers: [
        { user: { id: 3, image: '/images/user/user-22.jpg', name: 'Pedro Costa' }, value: 'Banda Sunrise' },
        { user: { id: 4, image: '/images/user/user-23.jpg', name: 'Ana Oliveira' }, value: 'DJ Nightfall' }
      ]
    },
    {
      id: 103,
      title: 'Quais áreas você visitou? (múltipla escolha - múltiplas respostas)',
      type: 'multiple_choice',
      answers: [
        { user: { id: 5, image: '/images/user/user-24.jpg', name: 'Carlos Ferreira' }, value: ['Palco Principal', 'Área VIP', 'Food Trucks'] },
        { user: { id: 1, image: '/images/user/user-20.jpg', name: 'João Silva' }, value: ['Palco Secundário', 'Área VIP'] }
      ]
    },
    {
      id: 104,
      title: 'Você indicaria o evento para um amigo? (enquete)',
      type: 'poll',
      answers: [
        { user: { id: 2, image: '/images/user/user-21.jpg', name: 'Maria Santos' }, value: 'Sim' },
        { user: { id: 3, image: '/images/user/user-22.jpg', name: 'Pedro Costa' }, value: 'Não' }
      ]
    }
  ];

  private expandedQuestionIds = new Set<number>();

  // Estado de DataTable por pergunta (filtro/paginação)
  private questionTableState: Record<number, { currentPage: number; itemsPerPage: number; searchTerm: string }> = {};

  getQuestionState(id: number) {
    if (!this.questionTableState[id]) {
      this.questionTableState[id] = { currentPage: 1, itemsPerPage: 8, searchTerm: '' };
    }
    return this.questionTableState[id];
  }

  toggleQuestion(id: number) {
    if (this.expandedQuestionIds.has(id)) {
      this.expandedQuestionIds.delete(id);
    } else {
      this.expandedQuestionIds.add(id);
      // inicializa estado ao abrir
      this.getQuestionState(id);
    }
  }

  isQuestionExpanded(id: number): boolean {
    return this.expandedQuestionIds.has(id);
  }

  exportQuestionAnswersCSV(question: QuestionItem) {
    const rows = question.answers.map(ans => ({
      'Pergunta': question.title,
      'Usuário': ans.user.name,
      'Resposta': Array.isArray(ans.value) ? (ans.value as string[]).join(', ') : (ans.value as string)
    }));

    const csvContent = this.convertToCSV(rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `respostas-pergunta-${question.id}-${new Date().toISOString().split('T')[0]}.csv`;
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  exportAllAnswersCSV() {
    const rows: any[] = [];
    this.questions.forEach(q => {
      q.answers.forEach(ans => {
        rows.push({
          'Pergunta': q.title,
          'Usuário': ans.user.name,
          'Resposta': Array.isArray(ans.value) ? (ans.value as string[]).join(', ') : (ans.value as string)
        });
      });
    });

    const csvContent = this.convertToCSV(rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `respostas-todas-${new Date().toISOString().split('T')[0]}.csv`;
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Helpers de filtro/paginação por pergunta
  updateQuestionSearchTerm(id: number, term: string) {
    const state = this.getQuestionState(id);
    state.searchTerm = term || '';
    state.currentPage = 1;
  }

  onQuestionItemsPerPageChange(id: number) {
    const state = this.getQuestionState(id);
    state.currentPage = 1;
  }

  handleQuestionPageChange(id: number, page: number) {
    const state = this.getQuestionState(id);
    const total = this.getQuestionTotalPagesById(id);
    if (page >= 1 && page <= total) {
      state.currentPage = page;
    }
  }

  private normalizeAnswerValue(value: string | string[]): string {
    return Array.isArray(value) ? value.join(', ') : value;
  }

  getQuestionFilteredAnswers(question: QuestionItem): AnswerItem[] {
    const state = this.getQuestionState(question.id);
    const term = state.searchTerm.toLowerCase();
    return question.answers.filter(ans => {
      const nameMatch = ans.user.name.toLowerCase().includes(term);
      const answerText = this.normalizeAnswerValue(ans.value).toLowerCase();
      const answerMatch = answerText.includes(term);
      return nameMatch || answerMatch;
    });
  }

  getQuestionTotalItems(question: QuestionItem): number {
    return this.getQuestionFilteredAnswers(question).length;
  }

  getQuestionTotalPages(question: QuestionItem): number {
    const state = this.getQuestionState(question.id);
    return Math.ceil(this.getQuestionTotalItems(question) / state.itemsPerPage);
  }

  // Mesma lógica porém por id (para uso em bindings que passam id)
  private getQuestionTotalPagesById(id: number): number {
    const q = this.questions.find(x => x.id === id);
    if (!q) return 1;
    return this.getQuestionTotalPages(q);
  }

  getQuestionStartIndex(question: QuestionItem): number {
    const state = this.getQuestionState(question.id);
    return (state.currentPage - 1) * state.itemsPerPage;
  }

  getQuestionEndIndex(question: QuestionItem): number {
    return Math.min(this.getQuestionStartIndex(question) + this.getQuestionState(question.id).itemsPerPage, this.getQuestionTotalItems(question));
  }

  getQuestionPageAnswers(question: QuestionItem): AnswerItem[] {
    const filtered = this.getQuestionFilteredAnswers(question);
    const start = this.getQuestionStartIndex(question);
    const end = this.getQuestionEndIndex(question);
    return filtered.slice(start, end);
  }

  toAnswerText(value: string | string[]): string {
    return Array.isArray(value) ? value.join(', ') : value;
  }

  // -----------------
  // Gráficos por pergunta (ApexCharts)
  // -----------------

  questionBarChart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 220,
    toolbar: { show: false }
  };

  questionBarPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 6,
      borderRadiusApplication: 'end'
    }
  };

  questionBarDataLabels: ApexDataLabels = { enabled: false };
  questionBarLegend: ApexLegend = { show: false };
  questionBarYAxis: ApexYAxis = { title: { text: undefined } };
  questionBarColors: string[] = ['#465fff'];

  private computeCounts(question: QuestionItem): { labels: string[]; counts: number[] } | null {
    if (question.type === 'text') return { labels: [], counts: [] };
    const map = new Map<string, number>();
    for (const ans of question.answers) {
      if (Array.isArray(ans.value)) {
        // múltiplas escolhas
        for (const v of ans.value) {
          map.set(v, (map.get(v) || 0) + 1);
        }
      } else {
        const v = ans.value;
        map.set(v, (map.get(v) || 0) + 1);
      }
    }
    const labels = Array.from(map.keys());
    const counts = labels.map(l => map.get(l) || 0);
    return { labels, counts };
  }

  getQuestionChartSeries(question: QuestionItem): ApexAxisChartSeries {
    const agg = this.computeCounts(question)!;
    return [{ name: 'Respostas', data: agg.counts }];
  }

  getQuestionChartXAxis(question: QuestionItem): ApexXAxis {
    const agg = this.computeCounts(question)!;
    return {
      categories: agg.labels,
      axisBorder: { show: false },
      axisTicks: { show: false }
    };
  }

  getQuestionTotalResponses(question: QuestionItem): number {
    return question.answers.length;
  }
}
