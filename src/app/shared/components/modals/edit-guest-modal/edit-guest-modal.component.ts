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

    // Limpa erro de duplicidade ao editar o valor
    const emailCtrl = this.editForm.get('email');
    const docCtrl = this.editForm.get('documentNumber');
    if (emailCtrl) {
      emailCtrl.valueChanges.subscribe(() => {
        const errs = emailCtrl.errors || {};
        if (errs['duplicate']) {
          const { duplicate, apiMessage, ...rest } = errs as any;
          const nextErrs = Object.keys(rest).length ? rest : null;
          emailCtrl.setErrors(nextErrs);
        }
      });
    }
    if (docCtrl) {
      docCtrl.valueChanges.subscribe(() => {
        const errs = docCtrl.errors || {};
        if (errs['duplicate']) {
          const { duplicate, apiMessage, ...rest } = errs as any;
          const nextErrs = Object.keys(rest).length ? rest : null;
          docCtrl.setErrors(nextErrs);
        }
      });
    }
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

  resetForm() {
    // Limpa erros e volta aos valores padrão
    this.editForm.reset({
      name: '',
      email: '',
      phone: '',
      documentNumber: '',
      documentType: 'rg',
      guestType: 'normal'
    });
    Object.keys(this.editForm.controls).forEach((key) => {
      const ctrl = this.editForm.get(key);
      ctrl?.setErrors(null);
      ctrl?.markAsPristine();
      ctrl?.markAsUntouched();
    });
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
    // Ao cancelar/fechar, zerar formulário
    this.resetForm();
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