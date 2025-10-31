import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationWithIconComponent } from '../../../shared/components/tables/data-tables/table-one/pagination-with-icon/pagination-with-icon.component';
import { GuestCardModalComponent } from '../../../shared/components/modals/guest-card-modal/guest-card-modal.component';
import { EditGuestModalComponent } from '../../../shared/components/modals/edit-guest-modal/edit-guest-modal.component';
import { CardSettingsComponent, CardSettings } from '../../../shared/components/cards/card-settings/card-settings.component';
import { Guest } from '../../../shared/interfaces/guest.interface';

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
  primaryColor: string;
  secondaryColor: string;
  showLogo: boolean;
  showQRCode: boolean;
  image: string;
  cardBackgroundType: 'gradient' | 'image';
  cardBackgroundImage?: string;
}

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationWithIconComponent, GuestCardModalComponent, EditGuestModalComponent, CardSettingsComponent],
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.css'
})
export class EventViewComponent {
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

  constructor() {
    // Converter dados dos convidados para o formato do DataTable
    this.tableData = this.guests.map(guest => ({
      id: guest.id,
      user: { image: guest.image, name: guest.name },
      email: guest.email,
      phone: guest.phone,
      status: guest.status
    }));
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
}