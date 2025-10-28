import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';
import { TeamService, Team } from '../../../shared/services/team.service';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserInfoCardComponent } from '../../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../../shared/components/user-profile/user-address-card/user-address-card.component';

@Component({
  selector: 'app-profile-qr',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
  ],
  templateUrl: './profile-qr.component.html',
  styles: ``
})
export class ProfileQrComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;
  showTeamModal = false;
  availableTeams: Team[] = [];
  isLoadingTeams = false;

  constructor(
    private authService: AuthService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadTeams();
  }

  private loadTeams(): void {
    this.isLoadingTeams = true;
    this.teamService.getAllTeams().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableTeams = response.data;
        } else {
          console.error('Erro ao carregar times:', response.message);
        }
        this.isLoadingTeams = false;
      },
      error: (error) => {
        console.error('Erro ao carregar times:', error);
        this.isLoadingTeams = false;
      }
    });
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

  getPlanGradientStyle(): string {
    const planName = this.user?.plan?.name || 'Bronze';
    
    switch (planName) {
      case 'Bronze':
        return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      case 'Silver':
        return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 'Gold':
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      default:
        // Plano padrão roxo para casos não encontrados
        return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    }
  }

  openTeamModal(): void {
    console.log('Modal do time clicado no profile-qr!');
    this.showTeamModal = true;
  }

  closeTeamModal(): void {
    this.showTeamModal = false;
  }

  selectTeam(team: any): void {
    if (this.user) {
      this.user.team = {
        name: team.name,
        short_name: team.short_name,
        abbreviation: team.short_name.toUpperCase(),
        shield: team.shield
      };
    }
    this.closeTeamModal();
    console.log('Time selecionado:', team.short_name);
  }
}