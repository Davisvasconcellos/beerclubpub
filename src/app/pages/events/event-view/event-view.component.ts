import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexXAxis, ApexLegend, ApexYAxis } from 'ng-apexcharts';
import { PaginationWithIconComponent } from '../../../shared/components/tables/data-tables/table-one/pagination-with-icon/pagination-with-icon.component';
import { GuestCardModalComponent } from '../../../shared/components/modals/guest-card-modal/guest-card-modal.component';
import { EditGuestModalComponent } from '../../../shared/components/modals/edit-guest-modal/edit-guest-modal.component';
import { CardSettingsComponent, CardSettings } from '../../../shared/components/cards/card-settings/card-settings.component';
import { Guest } from '../../../shared/interfaces/guest.interface';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, ApiEvent } from '../event.service';

interface TableRowData {
  id: number;
  user: { image: string | undefined; name: string };
  email: string;
  phone: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
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
  imports: [CommonModule, FormsModule, TranslateModule, NgApexchartsModule, PaginationWithIconComponent, GuestCardModalComponent, EditGuestModalComponent, CardSettingsComponent],
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.css'
})
export class EventViewComponent implements OnInit {
  activeTab: string = 'detalhes';

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
        item.user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.phone.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valueA: any, valueB: any;

        if (this.sortKey === 'name') {
          valueA = a.user.name;
          valueB = b.user.name;
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

  guests: Guest[] = [
    {
      id: 1,
      image: '/images/user/user-20.jpg',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      status: 'Confirmado'
    },
    {
      id: 2,
      image: '/images/user/user-21.jpg',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      status: 'Pendente'
    },
    {
      id: 3,
      image: '/images/user/user-22.jpg',
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 77777-7777',
      status: 'Confirmado'
    },
    {
      id: 4,
      image: '/images/user/user-23.jpg',
      name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
      phone: '(11) 66666-6666',
      status: 'Cancelado'
    },
    {
      id: 5,
      image: '/images/user/user-24.jpg',
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@email.com',
      phone: '(11) 55555-5555',
      status: 'Confirmado'
    }
  ];

  // Modal properties
  isGuestCardModalOpen = false;
  isEditGuestModalOpen = false;
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
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
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

  constructor(private route: ActivatedRoute, private eventService: EventService) {
    // Converter dados dos convidados para o formato do DataTable
    this.tableData = this.guests.map(guest => ({
      id: guest.id,
      user: { image: guest.image, name: guest.name },
      email: guest.email,
      phone: guest.phone,
      status: guest.status
    }));
  }

  ngOnInit(): void {
    const idCode = this.route.snapshot.paramMap.get('id_code');
    if (idCode) {
      this.loadEvent(idCode);
    }
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
        const cardBg = (ev as any).card_background || this.event.cardBackgroundImage || '/images/cards/event3.jpg';
        const slug = (ev as any).slug || '';
        const respName = (ev as any).resp_name || '';
        const respEmail = (ev as any).resp_email || '';
        const respPhone = (ev as any).resp_phone || '';

        this.event = {
          id: Number(ev.id) || 0,
          name,
          description,
          location: place,
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

        this.cardSettings = {
          backgroundType: 'image',
          backgroundImage: cardBg,
          primaryColor: color1,
          secondaryColor: color2,
          showLogo: true,
          showQRCode: true
        };
      },
      error: (err) => {
        console.error('Falha ao carregar evento', err);
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

  private normalizeImageUrl(url?: string | null): string | undefined {
    const clean = (url || '').trim();
    if (!clean) return undefined;
    if (/^https?:\/\//.test(clean)) return clean;
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
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

    if (field === 'start') {
      // Se a data de início mudou e é maior que a data de fim, limpar a data de fim
      if (this.event.endDate && newDate > this.event.endDate) {
        this.event.endDate = '';
      }
      this.event.startDate = newDate;
    } else if (field === 'end') {
      // Se a data de fim é menor que a data de início, ajustar para a data de início
      if (this.event.startDate && newDate < this.event.startDate) {
        this.event.endDate = this.event.startDate;
        target.value = this.event.startDate;
        return;
      }
      this.event.endDate = newDate;
    }
  }

  saveEvent() {
    console.log('Salvando evento:', this.event);
    // Implementar lógica de salvamento
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

  // Salvar configurações do cartão
  saveCardSettings() {
    // Atualiza eventData com as configurações atuais do cartão
    this.eventData = {
      ...this.eventData,
      primaryColor: this.cardSettings.primaryColor,
      secondaryColor: this.cardSettings.secondaryColor,
      showLogo: this.cardSettings.showLogo,
      showQRCode: this.cardSettings.showQRCode,
      cardBackgroundType: this.cardSettings.backgroundType,
      cardBackgroundImage: this.cardSettings.backgroundImage
    };

    console.log('Salvando configurações do cartão:', this.cardSettings);
    // Implementar lógica real de salvamento (API) aqui
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
