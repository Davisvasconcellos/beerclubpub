import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '../../../../shared/components/form/select/select.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-payments',
  imports: [
    CommonModule,
    FormsModule,
    SelectComponent,
    InputFieldComponent,
    ButtonComponent
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  // Propriedades para os formulários
  selectedTable: string = '';
  cashAmount: string = '';
  changeAmount: string = '';
  
  selectedCardTable: string = '';
  cardType: string = '';
  installments: string = '';
  cardAmount: string = '';

  // Opções para os selects
  tableOptions = [
    { value: '1', label: 'Mesa 1' },
    { value: '2', label: 'Mesa 2' },
    { value: '3', label: 'Mesa 3' },
    { value: '4', label: 'Mesa 4' },
    { value: '5', label: 'Mesa 5' }
  ];

  cardTypeOptions = [
    { value: 'credit', label: 'Crédito' },
    { value: 'debit', label: 'Débito' }
  ];

  installmentOptions = [
    { value: '1', label: '1x' },
    { value: '2', label: '2x' },
    { value: '3', label: '3x' },
    { value: '4', label: '4x' },
    { value: '5', label: '5x' },
    { value: '6', label: '6x' }
  ];

  onCashPayment() {
    console.log('Pagamento em dinheiro:', {
      table: this.selectedTable,
      amount: this.cashAmount,
      change: this.changeAmount
    });
  }

  onCardPayment() {
    console.log('Pagamento no cartão:', {
      table: this.selectedCardTable,
      cardType: this.cardType,
      installments: this.installments,
      amount: this.cardAmount
    });
  }
}
