import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinancialService } from '../../financial.service';
import { ContaPagar } from '../../models/conta-pagar';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-contas-pagar-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageBreadcrumbComponent
  ],
  templateUrl: './contas-pagar-list.component.html',
})
export class ContasPagarListComponent implements OnInit {
  protected readonly Math = Math;

  // Data
  allData: ContaPagar[] = [];
  paginatedData: ContaPagar[] = [];
  
  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  
  // Sorting
  sortKey: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Search
  searchTerm: string = '';

  constructor(private financial: FinancialService) {}

  ngOnInit() {
    this.financial.getContasPagar().subscribe(rows => {
      this.allData = rows;
      this.updatePagination();
    });
  }

  // Search
  get filteredData() {
    if (!this.searchTerm) {
      return this.allData;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.allData.filter(item => 
      (item.vendor_id && item.vendor_id.toLowerCase().includes(lowerTerm)) ||
      (item.description && item.description.toLowerCase().includes(lowerTerm)) ||
      (item.nf && item.nf.toLowerCase().includes(lowerTerm))
    );
  }

  // Pagination Logic
  updatePagination() {
    let data = this.filteredData;
    
    // Sort
    if (this.sortKey) {
      data = this.sortData(data, this.sortKey, this.sortOrder);
    }
    
    this.totalItems = data.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedData = data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  
  onSearchChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  // Sorting Logic
  handleSort(key: string) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
    this.updatePagination();
  }

  sortData(data: any[], key: string, order: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // Helpers for template
  get visiblePages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
