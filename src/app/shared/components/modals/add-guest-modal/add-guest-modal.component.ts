import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';

export interface NewGuestInput {
  name: string;
  email: string;
  phone: string;
  documentNumber: string;
  documentType: 'rg' | 'cpf' | 'passport';
  guestType: 'normal' | 'premium' | 'vip';
  checkin: boolean;
  check_in_method: 'staff_manual' | 'walk_in' | 'invited';
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
      email: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      documentType: ['rg', [Validators.required]],
      guestType: ['normal', [Validators.required]],
      checkin: [false]
    });

    const emailCtrl = this.form.get('email');
    const checkinCtrl = this.form.get('checkin');
    if (emailCtrl && checkinCtrl) {
      // Set initial state based on checkin
      if (checkinCtrl.value) {
        emailCtrl.disable({ emitEvent: false });
      }
      // Toggle disabled when checkin changes
      checkinCtrl.valueChanges.subscribe((checked: boolean) => {
        if (checked) {
          emailCtrl.disable();
        } else {
          emailCtrl.enable();
        }
      });
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.form.valid) {
      const value = this.form.value as any;
      const method: 'staff_manual' | 'walk_in' | 'invited' = !!value.checkin ? 'walk_in' : 'invited';
      const payload: NewGuestInput = {
        name: value.name,
        email: value.email,
        phone: value.phone,
        documentNumber: value.documentNumber,
        documentType: value.documentType,
        guestType: value.guestType,
        checkin: !!value.checkin,
        check_in_method: method
      };
      this.save.emit(payload);
    }
  }
}