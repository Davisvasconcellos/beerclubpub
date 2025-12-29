import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FinancialService } from '../../financial.service';

@Component({
  selector: 'app-contas-pagar-form',
  templateUrl: './contas-pagar-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ContasPagarFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, public financial: FinancialService) {
    this.form = this.fb.group({
      vendor_id: ['', Validators.required],
      nf: [''],
      description: [''],
      amount: [0, Validators.required],
      currency: ['BRL'],
      issue_date: [new Date(), Validators.required],
      due_date: [new Date(), Validators.required],
      status: ['open'],
      category: [''],
      cost_center: [''],
      attachment_url: [''],
    });
  }

  save() {
    if (this.form.invalid) return;
    console.log('Salvar conta a pagar', this.form.value);
  }
}

