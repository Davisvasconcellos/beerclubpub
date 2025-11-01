import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';
import { Store, StoreService } from './store.service';
import { LocalStorageService } from '../../../../shared/services/local-storage.service';

@Component({
  selector: 'app-home-admin',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent implements OnInit {
  currentUser: User | null = null;
  
  // Propriedades para o modal de lojas
  availableStores: Store[] = [];
  selectedStore: Store | null = null;
  showStoreModal = false;
  isLoadingStores = false;
  private readonly STORE_KEY = 'selectedStore';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStores();
    this.loadSelectedStore();
  }

  private loadStores(): void {
    this.isLoadingStores = true;
    this.storeService.getStores().subscribe({
      next: (stores: Store[]) => {
        this.availableStores = stores;
        this.isLoadingStores = false;
      },
      error: () => this.isLoadingStores = false
    });
  }

  private loadSelectedStore(): void {
    const storeId = this.localStorageService.getData(this.STORE_KEY);
    if (storeId && this.availableStores.length > 0) {
      this.selectedStore = this.availableStores.find(s => s.id === +storeId) || null;
    }
  }

  openStoreModal(): void { this.showStoreModal = true; }
  closeStoreModal(): void { this.showStoreModal = false; }

  selectStore(store: Store): void {
    this.selectedStore = store;
    this.localStorageService.saveData(this.STORE_KEY, store.id.toString());
    this.closeStoreModal();
  }
}
