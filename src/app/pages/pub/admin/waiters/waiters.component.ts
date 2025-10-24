import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { PaginationWithIconComponent } from '../../../../shared/components/tables/data-tables/table-one/pagination-with-icon/pagination-with-icon.component';

interface Waiter {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
  status: 'active' | 'inactive' | 'busy';
  shift: 'morning' | 'afternoon' | 'night';
}

interface TableRowData {
  id: number;
  waiter: Waiter;
}

@Component({
  selector: 'app-waiters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PaginationWithIconComponent
  ],
  templateUrl: './waiters.component.html'
})
export class WaitersComponent implements OnInit {

  // Formulário de cadastro
  waiterForm: FormGroup;

  // Dados da tabela
  tableData: TableRowData[] = [
    {
      id: 1,
      waiter: {
        id: 1,
        name: 'João Silva',
        email: 'joao@pub.com',
        phone: '(11) 99999-9999',
        image: '/images/user/user-20.jpg',
        status: 'active',
        shift: 'morning'
      }
    },
    {
      id: 2,
      waiter: {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@pub.com',
        phone: '(11) 88888-8888',
        image: '/images/user/user-21.jpg',
        status: 'busy',
        shift: 'afternoon'
      }
    },
    {
      id: 3,
      waiter: {
        id: 3,
        name: 'Pedro Costa',
        email: 'pedro@pub.com',
        phone: '(11) 77777-7777',
        image: '/images/user/user-22.jpg',
        status: 'inactive',
        shift: 'night'
      }
    }
  ];

  // Configurações da tabela
  columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { key: 'status', label: 'Status' },
    { key: 'shift', label: 'Turno' }
  ];

  // Controles de paginação e filtros
  currentPage = 1;
  itemsPerPage = 8;
  searchTerm = '';
  sortKey = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private fb: FormBuilder) {
    this.waiterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Inicialização do componente
  }

  // Dados filtrados
  get filteredData(): TableRowData[] {
    let filtered = this.tableData;

    if (this.searchTerm) {
      filtered = filtered.filter(item =>
        item.waiter.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.waiter.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.waiter.phone.includes(this.searchTerm)
      );
    }

    if (this.sortKey) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (this.sortKey === 'name') {
          aValue = a.waiter.name;
          bValue = b.waiter.name;
        } else if (this.sortKey === 'email') {
          aValue = a.waiter.email;
          bValue = b.waiter.email;
        } else if (this.sortKey === 'phone') {
          aValue = a.waiter.phone;
          bValue = b.waiter.phone;
        } else if (this.sortKey === 'status') {
          aValue = a.waiter.status;
          bValue = b.waiter.status;
        } else if (this.sortKey === 'shift') {
          aValue = a.waiter.shift;
          bValue = b.waiter.shift;
        }

        if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  // Dados da página atual
  get currentData(): TableRowData[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  // Informações de paginação
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
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  // Métodos de controle
  handleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  // Métodos do formulário
  onSubmit(): void {
    if (this.waiterForm.valid) {
      const formData = this.waiterForm.value;
      console.log('Novo garçom:', formData);
      
      // Aqui você adicionaria a lógica para salvar o garçom
      // Por exemplo, chamar um serviço para enviar os dados para o backend
      
      // Reset do formulário após envio
      this.waiterForm.reset();
    }
  }

  // Métodos para badges de status
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'busy':
        return 'Ocupado';
      default:
        return 'Desconhecido';
    }
  }

  getShiftBadgeClass(shift: string): string {
    switch (shift) {
      case 'morning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'afternoon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'night':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  getShiftText(shift: string): string {
    switch (shift) {
      case 'morning':
        return 'Manhã';
      case 'afternoon':
        return 'Tarde';
      case 'night':
        return 'Noite';
      default:
        return 'Indefinido';
    }
  }
}