import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinancialRoutingModule } from './financial-routing.module';
import { RouterModule } from '@angular/router';

// Angular Material modules (scoped to FinancialModule)
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

// NGX-Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Components
import { FinancialDashboardComponent } from './pages/dashboard/financial-dashboard.component';
import { ContasPagarListComponent } from './pages/contas-pagar/contas-pagar-list.component';
import { ContasPagarFormComponent } from './pages/contas-pagar/contas-pagar-form.component';
import { ContasReceberListComponent } from './pages/contas-receber/contas-receber-list.component';
import { ContasReceberFormComponent } from './pages/contas-receber/contas-receber-form.component';
import { FornecedoresListComponent } from './pages/fornecedores/fornecedores-list.component';
import { FornecedoresFormComponent } from './pages/fornecedores/fornecedores-form.component';
import { ClientesListComponent } from './pages/clientes/clientes-list.component';
import { ClientesFormComponent } from './pages/clientes/clientes-form.component';
import { PagamentosListComponent } from './pages/pagamentos/pagamentos-list.component';
import { PagamentosFormComponent } from './pages/pagamentos/pagamentos-form.component';
import { FinancialSettingsComponent } from './pages/configuracoes/financial-settings.component';
import { DespesasMenoresListComponent } from './pages/despesas-menores/despesas-menores-list.component';
import { ComissoesListComponent } from './pages/comissoes/comissoes-list.component';
import { FinancialReportsComponent } from './pages/relatorios/financial-reports.component';
import { SaldosBancariosListComponent } from './pages/saldos-bancarios/saldos-bancarios-list.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FinancialRoutingModule,
    // Material
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatCheckboxModule,
    // Charts
    NgxChartsModule,
    // Standalone components used in routes
    PagamentosListComponent,
    ClientesListComponent,
    FornecedoresListComponent,
    ContasReceberListComponent,
    ContasPagarListComponent,
    PagamentosFormComponent,
    FinancialDashboardComponent,
    FornecedoresFormComponent,
    ContasPagarFormComponent,
    ContasReceberFormComponent,
    ClientesFormComponent,
    FinancialSettingsComponent,
    DespesasMenoresListComponent,
    ComissoesListComponent,
    FinancialReportsComponent,
    SaldosBancariosListComponent
  ],
  declarations: []
})
export class FinancialModule {}
