import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../ui/modal/modal.component';

@Component({
  selector: 'app-add-event-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalComponent],
  templateUrl: './add-event-modal.component.html',
})
export class AddEventModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<{
    eventName: string;
    details: string;
    startDate: string;
    endDate: string;
    image: File | null;
  }>();

  eventName: string = '';
  details: string = '';
  startDate: string = '';
  endDate: string = '';
  imageFile: File | null = null;
  imagePreview: string | null = null;

  onSubmit() {
    if (this.eventName && this.details && this.startDate && this.endDate) {

      
      this.saveEvent.emit({
        eventName: this.eventName,
        details: this.details,
        startDate: this.startDate,
        endDate: this.endDate,
        image: this.imageFile
      });
      
      this.close.emit();
      this.resetForm();
    }
  }

  onImageSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  onStartDateChange() {
    // Se a data de fim é anterior à nova data de início, limpar a data de fim
    if (this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      this.endDate = '';
    }
  }

  onEndDateChange() {
    // Se a data de fim é anterior à data de início, ajustar para a data de início
    if (this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      this.endDate = this.startDate;
    }
  }

  resetForm() {
    this.eventName = '';
    this.details = '';
    this.startDate = '';
    this.endDate = '';
    this.imageFile = null;
    this.imagePreview = null;
  }
}