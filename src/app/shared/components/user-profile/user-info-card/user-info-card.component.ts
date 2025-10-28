import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { DatePickerComponent } from '../../form/date-picker/date-picker.component';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    DatePickerComponent,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit {

  constructor(
    public modal: ModalService,
    private authService: AuthService
  ) {}

  isOpen = false;
  openModal() { 
    this.isOpen = true; 
    // Reset form data to current user data when opening modal
    this.formData = { ...this.user };
  }
  closeModal() { this.isOpen = false; }

  user: any = {
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  };

  formData = {
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  };

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        firstName: currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
        phone: currentUser.phone || '',
        dateOfBirth: this.formatDateToBrazilian(currentUser.birth_date || '')
      };
      
      // Initialize form data
      this.formData = { ...this.user };
    }
  }

  // Phone mask formatting
  formatPhone(value: string): string {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply mask (xx)xxxx-xxxx
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)})${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    }
  }

  onPhoneInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const formattedValue = this.formatPhone(value);
    
    // Update form data with only numbers for API
    this.formData.phone = value.replace(/\D/g, '');
    
    // Update input display with mask
    input.value = formattedValue;
  }

  // Date formatting for Brazilian format
  formatDateToBrazilian(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  // Convert Brazilian date format to ISO format for API
  convertBrazilianDateToISO(brazilianDate: string): string {
    if (!brazilianDate) return '';
    
    const parts = brazilianDate.split('/');
    if (parts.length !== 3) return brazilianDate;
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Date change handler for date picker
  onDateChange(event: any): void {
    if (event && event.dateStr) {
      // The dateStr is already in Brazilian format (dd/mm/yyyy) from flatpickr
      this.formData.dateOfBirth = event.dateStr;
    }
  }

  handleSave() {
    console.log('Saving personal information changes...', this.formData);
    
    // Prepare update data with API field names
    const updateData = {
      name: `${this.formData.firstName} ${this.formData.lastName}`.trim(),
      phone: this.formData.phone.replace(/\D/g, ''), // Remove mask for API
      birth_date: this.convertBrazilianDateToISO(this.formData.dateOfBirth)
    };

    this.authService.updateUser(updateData).subscribe({
      next: (response) => {
        console.log('Personal information updated successfully:', response);
        this.closeModal();
        // Reload user data to reflect changes
        this.loadUserData();
      },
      error: (error) => {
        console.error('Error updating personal information:', error);
      }
    });
  }
}
