import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FinancialService } from '../../financial.service';

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, NgxChartsModule],
  templateUrl: './financial-dashboard.component.html',
})
export class FinancialDashboardComponent {
  // Mocked chart data: Receita vs Despesa
  revenueVsExpense = [
    { name: 'Receita', series: [{ name: 'Jan', value: 12000 }, { name: 'Fev', value: 10500 }, { name: 'Mar', value: 14200 }] },
    { name: 'Despesa', series: [{ name: 'Jan', value: 8000 }, { name: 'Fev', value: 9500 }, { name: 'Mar', value: 9100 }] },
  ];

  constructor(public financial: FinancialService) {}
}
