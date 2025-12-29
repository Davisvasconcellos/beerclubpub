import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FinancialService } from '../../financial.service';
import { ContaReceber } from '../../models/conta-receber';

@Component({
  selector: 'app-contas-receber-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './contas-receber-list.component.html',
})
export class ContasReceberListComponent {
  displayedColumns: string[] = ['cliente', 'venda', 'nf', 'parcela', 'vendedor', 'vencimento', 'status', 'comissao', 'acoes'];
  dataSource = new MatTableDataSource<ContaReceber>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalRecebidoMes = 0;

  constructor(private financial: FinancialService) {
    this.financial.getContasReceber().subscribe(rows => {
      this.dataSource.data = rows;
      // Simplified total: soma do sale_total onde status === 'received'
      this.totalRecebidoMes = rows
        .filter(r => r.status === 'received')
        .reduce((acc, cur) => acc + (cur.sale_total || 0), 0);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.pageSize = 5;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  parcelaLabel(r: ContaReceber): string {
    const total = r.parcelas?.length || 0;
    const current = r.parcelas?.find(p => !p.paid)?.number || 1;
    return `${current}/${total}`;
  }
}
