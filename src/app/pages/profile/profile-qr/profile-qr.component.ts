import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';
import { TeamService, Team } from '../../../shared/services/team.service';
import { ImageUploadService } from '../../../shared/services/image-upload.service';
import { UserInfoCardComponent } from '../../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../../shared/components/user-profile/user-address-card/user-address-card.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-profile-qr',
  standalone: true,
  imports: [
    CommonModule,
    UserInfoCardComponent,
    UserAddressCardComponent,
    ModalComponent,
    QRCodeComponent,
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
  avatarPreview: string | null = null;

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private imageUploadService: ImageUploadService
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

    // Primeiro, tenta obter o usuário do cache para uma exibição rápida
    const cachedUser = this.authService.getCurrentUser();
    if (cachedUser) {
      this.user = cachedUser;
      console.log('📥 Dados do usuário carregados do CACHE:', this.user);
    }

    // Em seguida, sempre busca os dados mais recentes da API
    this.authService.getUserMe().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data.user;
          console.log('📥 Dados do usuário carregados da API:', this.user);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
        this.error = 'Erro ao carregar dados do usuário';
        // Se a busca na API falhar e não houver cache, usa o usuário padrão
        if (!this.user) {
          this.user = this.getDefaultUser();
        }
        this.isLoading = false;
      }
    });
  }

  get qrData() {
    return this.user?.id_code || '0';
  }

  get qrUrl() {
    // Mantém a URL da API como fallback, mas agora usaremos o componente QR nativo
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

    switch (planName.toLowerCase()) {
      case 'bronze':
        // Gradiente bronze mais rico e quente
        return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #8B4513 100%)';
      case 'silver':
      case 'prata':
        // Gradiente prata mais brilhante e elegante
        return 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 30%, #A8A8A8 70%, #808080 100%)';
      case 'gold':
      case 'ouro':
        // Gradiente ouro mais luxuoso e vibrante
        return 'linear-gradient(135deg, #FFD700 0%, #FFC107 25%, #FF8F00 75%, #E65100 100%)';
      default:
        // Plano padrão roxo
        return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    }
  }

  openTeamModal(): void {
    console.log('Modal do time clicado no profile-qr!');
    this.showTeamModal = true;
    // Só carrega os times se ainda não foram carregados
    if (this.availableTeams.length === 0 && !this.isLoadingTeams) {
      this.loadTeams();
    }
  }

  closeTeamModal(): void {
    this.showTeamModal = false;
  }

  selectTeam(team: any): void {
    console.log('ID do time selecionado:', team.id);
    console.log('Dados completos do time:', team);
    
    if (this.user) {
      // Atualizar localmente primeiro
      this.user.team = {
        name: team.name,
        short_name: team.short_name,
        abbreviation: team.short_name.toUpperCase(),
        shield: team.shield
      };
      
      // Preparar dados para envio à API
      const updateData = {
        team_user: team.id
      };
      
      console.log('Enviando atualização para API:', updateData);
      
      // Enviar atualização para a API
      this.authService.updateUser(updateData).subscribe({
        next: (response) => {
          console.log('Time atualizado com sucesso:', response);
          if (response.success && response.data) {
            this.user = response.data.user;
          }
        },
        error: (error) => {
          console.error('Erro ao atualizar time:', error);
          // Em caso de erro, reverter a mudança local
          if (this.user) {
            this.user.team = undefined;
          }
        }
      });
    }
    
    this.closeTeamModal();
  }

  // Métodos para upload de avatar
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      console.log('📁 Arquivo selecionado:', file.name);
      
      // Mostrar preview imediato
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.avatarPreview = e.target.result as string;
          console.log('👁️ Preview carregado');
        }
      };
      reader.readAsDataURL(file);
      
      // Fazer upload usando o novo serviço
      await this.uploadAvatar(file);
    }
  }

  async uploadAvatar(file: File): Promise<void> {
    try {
      // Usar o novo serviço de upload
      const result = await this.imageUploadService.uploadAvatar(file);
      
      if (result.success) {
        // Setar preview para a URL retornada imediatamente
        this.avatarPreview = result.filePath || null;
        
        // Recarregar dados do usuário para atualizar o avatar
        this.loadUserData();
        
      } else {
        console.log('❌ Erro no upload:', result.error);
        
        // Reverter preview
        this.revertAvatarPreview();
      }
      
    } catch (error) {
      console.log('💥 Erro inesperado no upload:', error);
      
      // Reverter preview
      this.revertAvatarPreview();
    }
  }

  private revertAvatarPreview(): void {
    if (this.user?.avatar_url) {
      this.avatarPreview = this.user.avatar_url;
    } else {
      this.avatarPreview = 'images/user/default-avatar.jpg';
    }
  }
}