import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pagamentos-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './pagamentos-form.component.html',
})
export class PagamentosFormComponent {
  form: FormGroup;

  methods = ['Dinheiro', 'PIX', 'Cartão', 'Transferência', 'Boleto'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      related_account_id_code: ['', Validators.required],
      amount: [0, Validators.required],
      date: ['', Validators.required],
      method: ['', Validators.required],
      partial: [false],
      notes: [''],
    });
  }

  save() {
    if (this.form.invalid) return;
    console.log('Salvar pagamento', this.form.value);
  }
}
