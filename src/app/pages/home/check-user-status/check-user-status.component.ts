import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idCode = params['id_code'];
      if (idCode) {
        this.verifyUser(idCode);
      } else {
        this.isLoading = false;
        this.error = 'Nenhum código de cliente foi fornecido para verificação.';
        this.user = this.getDefaultUser();
      }
    });
  }

  verifyUser(idCode: string): void {
    this.userService.verifyUserStatus(idCode).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.user = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao verificar status do usuário:', err);
        this.error = err.error?.message || 'Cliente não encontrado ou código inválido.';
        this.isLoading = false;
        this.user = this.getDefaultUser();
      }
    });
  }

  private getDefaultUser(): User {
    return {
      id: 0,
      id_code: '0',
      name: 'Cliente não encontrado',
      email: '...',
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

  getPlanGradientStyle(planName?: string): string {
    const plan = planName || 'Bronze';
    
    // Usando if/else para evitar erro de TypeScript com strings não tipadas
    if (plan === 'Bronze') {
      // Gradiente bronze mais rico e quente
      return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #8B4513 100%)';
    } else if (plan === 'Silver' || plan === 'Prata') {
      // Gradiente prata mais brilhante e elegante
      return 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 30%, #A8A8A8 70%, #808080 100%)';
    } else if (plan === 'Gold' || plan === 'Ouro') {
      // Gradiente ouro mais luxuoso e vibrante
      return 'linear-gradient(135deg, #FFD700 0%, #FFC107 25%, #FF8F00 75%, #E65100 100%)';
    } else {
      // Plano padrão roxo
      return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    }
  }

  getPlanBorderStyle(planName: string | undefined): string {
    switch (planName) {
      case 'Bronze':
        return 'border-amber-500';
      case 'Silver':
      case 'Prata':
        return 'border-gray-500';
      case 'Gold':
      case 'Ouro':
        return 'border-yellow-500';
      default:
        // Plano padrão (roxo/Premium) para casos onde não há plano definido
        return 'border-purple-500';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}
