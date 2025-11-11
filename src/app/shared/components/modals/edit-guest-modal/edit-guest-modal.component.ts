import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';
import { Guest } from '../../../interfaces/guest.interface';

@Component({
  selector: 'app-edit-guest-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './edit-guest-modal.component.html',
  styleUrl: './edit-guest-modal.component.css'
})
export class EditGuestModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() guest: Guest | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Guest>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      documentNumber: [''],
      documentType: ['rg'],
      guestType: ['normal', [Validators.required]]
    });
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      documentNumber: [''],
      documentType: ['rg'],
      guestType: ['normal', [Validators.required]]
    });
  }

  ngOnChanges() {
    if (this.guest && this.editForm) {
      this.editForm.patchValue({
        name: this.guest.name,
        email: this.guest.email,
        phone: this.guest.phone,
        documentNumber: (this.guest as any).documentNumber || '',
        documentType: (this.guest as any).documentType || 'rg',
        guestType: (this.guest as any).guestType || 'normal'
      });
    }
  }

  onSave() {
    if (this.editForm.valid && this.guest) {
      const updatedGuest: Guest = {
        ...this.guest,
        name: this.editForm.value.name,
        email: this.editForm.value.email,
        phone: this.editForm.value.phone,
        ...(this.editForm.value.documentNumber ? { documentNumber: this.editForm.value.documentNumber } : {}),
        ...(this.editForm.value.documentType ? { documentType: this.editForm.value.documentType } : {}),
        ...(this.editForm.value.guestType ? { guestType: this.editForm.value.guestType } : {})
      };
      this.save.emit(updatedGuest);
    }
  }

  onClose() {
    this.close.emit();
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}