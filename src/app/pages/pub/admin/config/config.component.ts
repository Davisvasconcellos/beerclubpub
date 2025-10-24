import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { SelectComponent } from '../../../../shared/components/form/select/select.component';
import { TextAreaComponent } from '../../../../shared/components/form/input/text-area.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { CheckboxComponent } from '../../../../shared/components/form/input/checkbox.component';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    TextAreaComponent,
    ButtonComponent,
    CheckboxComponent,
  ],
  templateUrl: './config.component.html',
  styleUrls: []
})
export class ConfigComponent {
  activeTab: string = 'establishment';

  // Estabelecimento
  establishmentName: string = '';
  capacity: string = '';
  establishmentType: string = '';
  establishmentDescription: string = '';
  establishmentTypes = [
    { value: 'bar', label: 'Bar' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'pub', label: 'Pub' },
    { value: 'brewery', label: 'Cervejaria' },
    { value: 'nightclub', label: 'Casa Noturna' }
  ];

  // Dados da empresa
  companyName: string = '';
  cnpj: string = '';
  phone: string = '';
  email: string = '';
  address: string = '';

  // Horários de funcionamento
  mondayOpen: string = '';
  mondayClose: string = '';
  tuesdayOpen: string = '';
  tuesdayClose: string = '';
  wednesdayOpen: string = '';
  wednesdayClose: string = '';
  thursdayOpen: string = '';
  thursdayClose: string = '';
  fridayOpen: string = '';
  fridayClose: string = '';
  saturdayOpen: string = '';
  saturdayClose: string = '';
  sundayOpen: string = '';
  sundayClose: string = '';

  // Métodos de pagamento
  acceptCash: boolean = false;
  acceptCard: boolean = false;
  acceptPix: boolean = false;
  acceptVoucher: boolean = false;

  // Integração com delivery
  deliveryEnabled: boolean = false;
  deliveryRadius: string = '';
  deliveryFee: string = '';
  minOrderValue: string = '';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSave(): void {
    // Save configuration
    console.log('Saving configuration...');
    console.log({
      establishment: {
        name: this.establishmentName,
        capacity: this.capacity,
        type: this.establishmentType,
        description: this.establishmentDescription
      },
      company: {
        name: this.companyName,
        cnpj: this.cnpj,
        phone: this.phone,
        email: this.email,
        address: this.address
      },
      hours: {
        monday: { open: this.mondayOpen, close: this.mondayClose },
        tuesday: { open: this.tuesdayOpen, close: this.tuesdayClose },
        wednesday: { open: this.wednesdayOpen, close: this.wednesdayClose },
        thursday: { open: this.thursdayOpen, close: this.thursdayClose },
        friday: { open: this.fridayOpen, close: this.fridayClose },
        saturday: { open: this.saturdayOpen, close: this.saturdayClose },
        sunday: { open: this.sundayOpen, close: this.sundayClose }
      },
      payments: {
        cash: this.acceptCash,
        card: this.acceptCard,
        pix: this.acceptPix,
        voucher: this.acceptVoucher
      },
      delivery: {
        enabled: this.deliveryEnabled,
        radius: this.deliveryRadius,
        fee: this.deliveryFee,
        minOrder: this.minOrderValue
      }
    });
  }

  onCancel(): void {
    // Cancel changes
    console.log('Cancelling changes...');
  }
}