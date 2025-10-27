import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { AuthService, User } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
    UserMetaCardComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    // Primeiro, tenta obter o usuário do cache
    this.user = this.authService.getCurrentUser();

    // Depois, busca dados atualizados da API
    this.authService.getUserMe().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data.user;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
        this.error = 'Erro ao carregar dados do usuário';
        this.isLoading = false;
        
        // Se falhar, mantém os dados do cache se existirem
        if (!this.user) {
          this.user = this.getDefaultUser();
        }
      }
    });
  }

  get qrData() {
    return `user:${this.user?.email || 'usuario@email.com'}`;
  }

  get qrUrl() {
    const encoded = encodeURIComponent(this.qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encoded}`;
  }

  private getDefaultUser(): User {
    return {
      id: 0,
      id_code: '0',
      name: 'Usuário',
      email: 'usuario@email.com',
      role: 'customer',
      email_verified: false,
      status: 'active',
      plan: {
        id: 0,
        name: 'Bronze',
        price: '0',
        description: 'Plano padrão'
      }
    };
  }
}
