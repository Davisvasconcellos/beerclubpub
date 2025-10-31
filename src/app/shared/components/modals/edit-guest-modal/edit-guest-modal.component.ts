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
      instagram: [''],
      linkedin: [''],
      twitter: [''],
      facebook: ['']
    });
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      instagram: ['']
    });
  }

  ngOnChanges() {
    if (this.guest && this.editForm) {
      this.editForm.patchValue({
        name: this.guest.name,
        email: this.guest.email,
        phone: this.guest.phone,
        instagram: this.guest.instagram || ''
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
        instagram: this.editForm.value.instagram || undefined
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