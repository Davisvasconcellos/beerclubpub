import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FinancialService } from '../../financial.service';

@Component({
  selector: 'app-contas-receber-form',
  templateUrl: './contas-receber-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ContasReceberFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, public financial: FinancialService) {
    this.form = this.fb.group({
      client_id: ['', Validators.required],
      seller_id: [''],
      sale_total: [0, Validators.required],
      nf: [''],
      description: [''],
      commission_rate: [0],
      due_date: [new Date(), Validators.required],
      status: ['open'],
      parcelas: this.fb.array([]),
    });
  }

  get parcelas(): FormArray {
    return this.form.get('parcelas') as FormArray;
  }

  addParcela() {
    this.parcelas.push(this.fb.group({
      number: [this.parcelas.length + 1],
      total: [0],
      value: [0, Validators.required],
      due_date: [new Date(), Validators.required],
      paid: [false],
    }));
  }

  removeParcela(index: number) {
    this.parcelas.removeAt(index);
  }

  save() {
    if (this.form.invalid) return;
    // For now, just log; integration with backend will come later
    console.log('Salvar contas a receber', this.form.value);
  }
}
