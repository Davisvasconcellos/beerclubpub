import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fornecedores-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './fornecedores-form.component.html',
})
export class FornecedoresFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      cnpj: [''],
      email: [''],
      phone: [''],
      bank: this.fb.group({ account: [''], agency: [''] }),
    });
  }

  save() {
    if (this.form.invalid) return;
    console.log('Salvar fornecedor', this.form.value);
  }
}
