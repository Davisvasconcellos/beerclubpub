import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationWithIconComponent } from '../../../../shared/components/tables/data-tables/table-one/pagination-with-icon/pagination-with-icon.component';
import { FormsModule } from '@angular/forms';

interface Client {
  image: string;
  name: string;
  email: string;
  phone: string;
}

interface TableRowData {
  id: number;
  client: Client;
  time: string;
  plan: 'bronze' | 'prata' | 'gold';
}

type SortKey = 'name' | 'email' | 'time' | 'plan';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    PaginationWithIconComponent,
    FormsModule
  ],
  templateUrl: './clients.component.html',
  styles: ``
})
export class ClientsComponent {

  tableData: TableRowData[] = [
    {
      id: 1,
      client: { 
        image: '/images/user/user-20.jpg', 
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234'
      },
      time: 'FLA',
      plan: 'gold',
    },
    {
      id: 2,
      client: { 
        image: '/images/user/user-21.jpg', 
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 98888-5678'
      },
      time: 'VAS',
      plan: 'prata',
    },
    {
      id: 3,
      client: { 
        image: '/images/user/user-22.jpg', 
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 97777-9012'
      },
      time: 'PAL',
      plan: 'gold',
    },
    {
      id: 4,
      client: { 
        image: '/images/user/user-23.jpg', 
        name: 'Ana Oliveira',
        email: 'ana.oliveira@email.com',
        phone: '(11) 96666-3456'
      },
      time: 'BOT',
      plan: 'bronze',
    },
    {
      id: 5,
      client: { 
        image: '/images/user/user-24.jpg', 
        name: 'Carlos Mendes',
        email: 'carlos.mendes@email.com',
        phone: '(11) 95555-7890'
      },
      time: 'FLU',
      plan: 'gold',
    },
    {
      id: 6,
      client: { 
        image: '/images/user/user-25.jpg', 
        name: 'Lucia Ferreira',
        email: 'lucia.ferreira@email.com',
        phone: '(11) 94444-2345'
      },
      time: 'COR',
      plan: 'prata',
    },
    {
      id: 7,
      client: { 
        image: '/images/user/user-26.jpg', 
        name: 'Roberto Lima',
        email: 'roberto.lima@email.com',
        phone: '(11) 93333-6789'
      },
      time: 'SAO',
      plan: 'bronze',
    },
    {
      id: 8,
      client: { 
        image: '/images/user/user-27.jpg', 
        name: 'Fernanda Souza',
        email: 'fernanda.souza@email.com',
        phone: '(11) 92222-0123'
      },
      time: 'SAN',
      plan: 'gold',
    },
    {
      id: 9,
      client: { 
        image: '/images/user/user-28.jpg', 
        name: 'Ricardo Alves',
        email: 'ricardo.alves@email.com',
        phone: '(11) 91111-4567'
      },
      time: 'GRE',
      plan: 'prata',
    },
    {
      id: 10,
      client: { 
        image: '/images/user/user-29.jpg', 
        name: 'Patricia Rocha',
        email: 'patricia.rocha@email.com',
        phone: '(11) 90000-8901'
      },
      time: 'INT',
      plan: 'bronze',
    },
  ];

  columns = [
    { key: 'name', label: 'Cliente' },
    { key: 'email', label: 'Email' },
    { key: 'time', label: 'Time' },
    { key: 'plan', label: 'Plano' },
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortKey: SortKey = 'name';
  sortOrder: SortOrder = 'asc';
  searchTerm: string = '';

  get filteredData(): TableRowData[] {
    const termLc = (this.searchTerm || '').toLowerCase();
    if (!termLc) {
      return this.tableData;
    }

    return this.tableData.filter(item => {
      const nameLc = (item.client?.name || '').toLowerCase();
      const emailLc = (item.client?.email || '').toLowerCase();
      const phoneStr = String(item.client?.phone || '');
      return (
        nameLc.includes(termLc) ||
        emailLc.includes(termLc) ||
        phoneStr.includes(this.searchTerm || '')
      );
    });
  }

  get sortedData(): TableRowData[] {
    return this.filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (this.sortKey === 'name') {
        aValue = (a.client?.name || '').toLowerCase();
        bValue = (b.client?.name || '').toLowerCase();
      } else if (this.sortKey === 'email') {
        aValue = (a.client?.email || '').toLowerCase();
        bValue = (b.client?.email || '').toLowerCase();
      } else if (this.sortKey === 'time') {
        aValue = a.time;
        bValue = b.time;
      } else if (this.sortKey === 'plan') {
        const planOrder = { 'bronze': 1, 'prata': 2, 'gold': 3 };
        aValue = planOrder[a.plan];
        bValue = planOrder[b.plan];
      }

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  get currentData(): TableRowData[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.sortedData.slice(startIndex, endIndex);
  }

  get totalItems(): number {
    return this.filteredData.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.startIndex + this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  handleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key as SortKey;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  }

  getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'bronze':
        return 'inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'prata':
        return 'inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'gold':
        return 'inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  getPlanText(plan: string): string {
    switch (plan) {
      case 'bronze':
        return 'Bronze';
      case 'prata':
        return 'Prata';
      case 'gold':
        return 'Gold';
      default:
        return plan;
    }
  }
}