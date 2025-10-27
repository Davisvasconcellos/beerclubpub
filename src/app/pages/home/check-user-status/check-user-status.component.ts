import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-check-user-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './check-user-status.component.html',
  styles: ``
})
export class CheckUserStatusComponent implements OnInit {
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

  getPlanGradientStyle(planName: string | undefined): string {
    switch (planName) {
      case 'Bronze':
        return 'bg-gradient-to-r from-amber-600 to-yellow-500';
      case 'Silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      default:
        // Plano padrão (roxo/Premium) para casos onde não há plano definido
        return 'bg-gradient-to-r from-purple-500 to-purple-700';
    }
  }

  getPlanBorderStyle(planName: string | undefined): string {
    switch (planName) {
      case 'Bronze':
        return 'border-amber-500';
      case 'Silver':
        return 'border-gray-500';
      case 'Gold':
        return 'border-yellow-500';
      default:
        // Plano padrão (roxo/Premium) para casos onde não há plano definido
        return 'border-purple-500';
    }
  }

  getBorderClass(status: 'valid' | 'delinquent' | 'blocked'): string {
    switch (status) {
      case 'valid':
        return 'border-green-500';
      case 'delinquent':
        return 'border-yellow-500';
      case 'blocked':
        return 'border-red-500';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}
