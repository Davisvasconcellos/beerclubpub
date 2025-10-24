import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.component.html'
})
export class TablesComponent {
  tabs = [
    { id: 'tables', label: 'Lista de Mesas' },
    { id: 'add-table', label: 'Cadastrar Mesa' }
  ];

  activeTab: string = 'tables';
}