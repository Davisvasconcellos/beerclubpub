import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './financial-reports.component.html',
})
export class FinancialReportsComponent {}
