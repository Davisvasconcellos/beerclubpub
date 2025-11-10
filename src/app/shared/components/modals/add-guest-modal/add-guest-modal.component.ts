import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';

export interface NewGuestInput {
  name: string;
  email: string;
  phone: string;
  documentNumber: string;
  checkin: boolean;
}

@Component({
  selector: 'app-add-guest-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './add-guest-modal.component.html',
  styleUrl: './add-guest-modal.component.css'
})
export class AddGuestModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewGuestInput>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      checkin: [false]
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.form.valid) {
      const value = this.form.value as NewGuestInput;
      this.save.emit({
        name: value.name,
        email: value.email,
        phone: value.phone,
        documentNumber: value.documentNumber,
        checkin: !!value.checkin
      });
    }
  }
}