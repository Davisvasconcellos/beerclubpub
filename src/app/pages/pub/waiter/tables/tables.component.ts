import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Table {
  id: number;
  number: string;
  status: 'free' | 'occupied' | 'reserved';
  customerName?: string;
  peopleCount?: number;
  products?: Product[];
  subtotal?: number;
}

@Component({
  selector: 'app-tables',
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent {
  showModal = false;
  selectedTable: Table | null = null;
  modalType: 'occupied' | 'free' | 'reserved' = 'occupied';
  showOpenTableForm = false;
  showReserveTableForm = false;
  customerName = '';
  reserveCustomerName = '';

  tables: Table[] = [
    { id: 1, number: '01', status: 'free' },
    { 
      id: 2, 
      number: '02', 
      status: 'occupied', 
      customerName: 'João Silva',
      peopleCount: 4,
      products: [
        { id: 1, name: 'Hambúrguer Clássico', price: 25.90, quantity: 2, image: '🍔' },
        { id: 2, name: 'Batata Frita', price: 12.50, quantity: 1, image: '🍟' },
        { id: 3, name: 'Coca-Cola 350ml', price: 6.00, quantity: 3, image: '🥤' }
      ]
    },
    { id: 3, number: '03', status: 'free' },
    { id: 4, number: '04', status: 'reserved', customerName: 'Maria Santos' },
    { 
      id: 5, 
      number: '05', 
      status: 'occupied', 
      customerName: 'Pedro Costa',
      peopleCount: 2,
      products: [
        { id: 4, name: 'Pizza Margherita', price: 32.90, quantity: 1, image: '🍕' },
        { id: 5, name: 'Suco de Laranja', price: 8.50, quantity: 2, image: '🧃' }
      ]
    },
    { id: 6, number: '06', status: 'free' },
    { id: 7, number: '07', status: 'free' },
    { 
      id: 8, 
      number: '08', 
      status: 'occupied', 
      customerName: 'Ana Oliveira',
      peopleCount: 6,
      products: [
        { id: 6, name: 'Heineken Longneck', price: 8.50, quantity: 4, image: '🍺' },
        { id: 7, name: 'Porção de Frango', price: 28.90, quantity: 1, image: '🍗' },
        { id: 8, name: 'Salada Caesar', price: 18.90, quantity: 2, image: '🥗' }
      ]
    },
    { id: 9, number: '09', status: 'free' },
    { id: 10, number: '10', status: 'reserved', customerName: 'Carlos Mendes' },
    { id: 11, number: '11', status: 'free' },
    { 
      id: 12, 
      number: '12', 
      status: 'occupied', 
      customerName: 'Lucia Ferreira',
      peopleCount: 3,
      products: [
        { id: 9, name: 'Stella Artois 600ml', price: 13.50, quantity: 2, image: '🍺' },
        { id: 10, name: 'Picanha Grelhada', price: 45.90, quantity: 1, image: '🥩' }
      ]
    },
    { id: 13, number: '13', status: 'free' },
    { id: 14, number: '14', status: 'free' },
    { 
      id: 15, 
      number: '15', 
      status: 'occupied', 
      customerName: 'Roberto Lima',
      peopleCount: 5,
      products: [
        { id: 11, name: 'Bohemia Longneck', price: 6.50, quantity: 3, image: '🍺' },
        { id: 12, name: 'Pastel de Queijo', price: 8.90, quantity: 4, image: '🥟' },
        { id: 13, name: 'Guaraná Antarctica', price: 5.50, quantity: 2, image: '🥤' }
      ]
    },
    { id: 16, number: '16', status: 'free' },
    { id: 17, number: '17', status: 'free' },
    { id: 18, number: '18', status: 'reserved', customerName: 'Fernanda Rocha' },
    { id: 19, number: '19', status: 'free' },
    { id: 20, number: '20', status: 'free' }
  ];

  openTableModal(table: Table) {
    this.selectedTable = table;
    
    if (table.status === 'occupied') {
      this.modalType = 'occupied';
      this.calculateSubtotal();
    } else if (table.status === 'free') {
      this.modalType = 'free';
    } else if (table.status === 'reserved') {
      this.modalType = 'reserved';
    }
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedTable = null;
    this.showOpenTableForm = false;
    this.showReserveTableForm = false;
    this.customerName = '';
    this.reserveCustomerName = '';
  }

  calculateSubtotal() {
    if (this.selectedTable && this.selectedTable.products) {
      this.selectedTable.subtotal = this.selectedTable.products.reduce(
        (total, product) => total + (product.price * product.quantity), 0
      );
    }
  }

  closeAccount() {
    if (this.selectedTable) {
      // Lógica para fechar conta
      console.log('Fechando conta da mesa:', this.selectedTable.number);
      // Aqui você pode implementar a navegação para a tela de pagamento
      this.closeModal();
    }
  }

  addProducts() {
    if (this.selectedTable) {
      // Lógica para adicionar produtos
      console.log('Adicionando produtos à mesa:', this.selectedTable.number);
      // Aqui você pode implementar a navegação para o menu
      this.closeModal();
    }
  }

  reserveTable() {
    this.showReserveTableForm = true;
  }

  confirmReservation() {
    if (this.selectedTable && this.reserveCustomerName.trim()) {
      // Encontrar a mesa no array e atualizar
      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable!.id);
      if (tableIndex !== -1) {
        this.tables[tableIndex] = {
          ...this.tables[tableIndex],
          status: 'reserved',
          customerName: this.reserveCustomerName.trim()
        };
      }
      this.closeModal();
    }
  }

  openReservedTable() {
    if (this.selectedTable && this.customerName.trim()) {
      // Encontrar a mesa no array e atualizar para ocupada
      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable!.id);
      if (tableIndex !== -1) {
        this.tables[tableIndex] = {
          ...this.tables[tableIndex],
          status: 'occupied',
          customerName: this.customerName.trim(),
          peopleCount: 1,
          products: [],
          subtotal: 0
        };
      }
      this.closeModal();
    }
  }

  releaseTable() {
    if (this.selectedTable) {
      // Encontrar a mesa no array e liberar
      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable!.id);
      if (tableIndex !== -1) {
        this.tables[tableIndex] = {
          ...this.tables[tableIndex],
          status: 'free',
          customerName: undefined,
          peopleCount: undefined,
          products: undefined,
          subtotal: undefined
        };
      }
      this.closeModal();
    }
  }

  showOpenForm() {
    this.showOpenTableForm = true;
  }

  openTable() {
    if (this.selectedTable && this.customerName.trim()) {
      // Encontrar a mesa no array e atualizar
      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable!.id);
      if (tableIndex !== -1) {
        this.tables[tableIndex] = {
          ...this.tables[tableIndex],
          status: 'occupied',
          customerName: this.customerName.trim(),
          peopleCount: 1,
          products: [],
          subtotal: 0
        };
      }
      this.closeModal();
    }
  }

  scanQRCode() {
    // Simulação de scan de QR code
    const mockCustomerName = 'Cliente QR Code';
    this.customerName = mockCustomerName;
    alert('QR Code escaneado! Nome do cliente: ' + mockCustomerName);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'free': return 'border-green-500';
      case 'occupied': return 'border-red-500';
      case 'reserved': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'free': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      default: return 'Indefinido';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'free': return 'text-green-600 dark:text-green-400';
      case 'occupied': return 'text-red-600 dark:text-red-400';
      case 'reserved': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }
}
