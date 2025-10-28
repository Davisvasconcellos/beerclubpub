import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { ViaCepService, AddressData } from '../../../services/viacep.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-address-card',
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
  ],
  templateUrl: './user-address-card.component.html',
  styles: ``
})
export class UserAddressCardComponent implements OnInit {

  constructor(
    public modal: ModalService,
    private viaCepService: ViaCepService,
    private authService: AuthService
  ) {}

  isOpen = false;
  isLoadingCep = false;
  cepError = '';

  openModal() { 
    this.isOpen = true;
    this.loadUserAddress();
  }
  closeModal() { 
    this.isOpen = false;
    this.cepError = '';
  }

  // Dados de exibição do endereço
  address = {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  };

  // Dados do formulário
  formData = {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil'
  };

  ngOnInit() {
    this.loadUserAddress();
  }

  loadUserAddress() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.address = {
        street: currentUser.address_street || '',
        number: currentUser.address_number || '',
        complement: currentUser.address_complement || '',
        neighborhood: currentUser.address_neighborhood || '',
        city: currentUser.address_city || '',
        state: currentUser.address_state || '',
        zipCode: currentUser.address_zip_code || '',
        country: 'Brasil'
      };
      
      // Initialize form data
      this.formData = { ...this.address };
    }
  }

  onCepInput(event: any) {
    let cep = event.target.value.replace(/\D/g, '');
    
    // Formatar CEP enquanto digita
    if (cep.length > 5) {
      cep = `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
    }
    
    this.formData.zipCode = cep;
    this.cepError = '';
    
    // Auto-buscar quando CEP estiver completo
    if (cep.replace(/\D/g, '').length === 8) {
      this.searchAddressByCep();
    }
  }

  searchAddressByCep() {
    const cep = this.formData.zipCode.replace(/\D/g, '');
    
    if (!this.viaCepService.isValidCep(cep)) {
      this.cepError = 'CEP inválido';
      return;
    }

    this.isLoadingCep = true;
    this.cepError = '';

    this.viaCepService.getAddressByCep(cep).subscribe({
      next: (addressData: AddressData) => {
        // Preencher campos automaticamente
        this.formData.street = addressData.street;
        this.formData.neighborhood = addressData.neighborhood;
        this.formData.city = addressData.city;
        this.formData.state = addressData.state;
        this.formData.zipCode = this.viaCepService.formatCep(addressData.zipCode);
        
        this.isLoadingCep = false;
      },
      error: (error) => {
        this.cepError = error.message;
        this.isLoadingCep = false;
      }
    });
  }

  handleSave() {
    console.log('Saving address changes...', this.formData);
    
    // Prepare update data with API field names
    const updateData = {
      address_street: this.formData.street,
      address_number: this.formData.number,
      address_complement: this.formData.complement,
      address_neighborhood: this.formData.neighborhood,
      address_city: this.formData.city,
      address_state: this.formData.state,
      address_zip_code: this.viaCepService.cleanCep(this.formData.zipCode)
    };

    this.authService.updateUser(updateData).subscribe({
      next: (response) => {
        console.log('Address updated successfully:', response);
        this.closeModal();
        // Reload address data to reflect changes
        this.loadUserAddress();
      },
      error: (error) => {
        console.error('Error updating address:', error);
      }
    });
  }
}
