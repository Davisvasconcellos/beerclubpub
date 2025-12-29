import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-saldos-bancarios-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './saldos-bancarios-list.component.html',
})
export class SaldosBancariosListComponent {}
