import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-financial-settings',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    FormsModule
  ],
  templateUrl: './financial-settings.component.html',
})
export class FinancialSettingsComponent {
  activeTab: string = 'apis';
  
  categories = [
    { name: 'Vendas', type: 'Receita' },
    { name: 'Serviços', type: 'Receita' },
    { name: 'Aluguel', type: 'Despesa' },
    { name: 'Fornecedores', type: 'Despesa' },
    { name: 'Marketing', type: 'Despesa' }
  ];

  tags = ['Urgente', 'Recorrente', 'Projeto X', 'Impostos'];

  bankAccounts = [
    { bank: 'Banco do Brasil', agency: '1234-5', account: '99999-9', balance: 5000.00 },
    { bank: 'Nubank', agency: '0001', account: '123456-7', balance: 1250.50 }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addCategory() {
    console.log('Add category clicked');
  }

  addTag() {
    console.log('Add tag clicked');
  }

  addAccount() {
    console.log('Add account clicked');
  }
}
