import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';
import { TeamService, Team } from '../../../shared/services/team.service';
import { ImageUploadService } from '../../../shared/services/image-upload.service';
import { UserInfoCardComponent } from '../../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../../shared/components/user-profile/user-address-card/user-address-card.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { ElementRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Interface precisa estar FORA da classe para não quebrar a sintaxe do TS
interface LocalUser extends User {
  avatar_url?: string;
  team?: {
    name: string;
    short_name: string;
    abbreviation: string;
    shield: string;
  };
}

@Component({
  selector: 'app-profile-qr',
  standalone: true,
  imports: [
    CommonModule,
    UserInfoCardComponent,
    UserAddressCardComponent,
    ModalComponent,
    QRCodeComponent,
    TranslateModule,
  ],
  templateUrl: './profile-qr.component.html',
  styles: ``
})
export class ProfileQrComponent implements OnInit {
  user: LocalUser | null = null;
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
      next: (response: unknown) => {
        const res = response as { success: boolean; data: Team[]; message?: string };
        if (res.success) {
          this.availableTeams = res.data;
        } else {
          console.error('Erro ao carregar times:', res.message);
        }
        this.isLoadingTeams = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar times:', error);
        this.isLoadingTeams = false;
      }
    });
  }

  loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    const cachedUser = this.authService.getCurrentUser();
    if (cachedUser) {
      this.user = cachedUser as LocalUser;
      console.log('📥 Dados do usuário carregados do CACHE:', this.user);
    }

    this.authService.getUserMe().subscribe({
      next: (response: unknown) => {
        const res = response as { success: boolean; data?: { user: LocalUser } };
        if (res.success && res.data) {
          this.user = res.data.user;
          console.log('📥 Dados do usuário carregados da API:', this.user);
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar dados do usuário:', error);
        this.error = 'Erro ao carregar dados do usuário';
        if (!this.user) {
          this.user = this.getDefaultUser();
        }
        this.isLoading = false;
      }
    });
  }

  private getDefaultUser(): LocalUser {
    return {
      id: 0,
      id_code: '0',
      name: 'Usuário',
      email: 'usuario@email.com',
      role: 'customer',
      email_verified: false,
      status: 'active',
      avatar_url: 'images/user/default-avatar.jpg',
      plan: {
        id: 0,
        name: 'Bronze',
        price: '0',
        description: 'Plano padrão'
      }
    };
  }

  // Métodos usados no template
  get qrData(): string {
    return this.user?.id_code || '0';
  }

  get qrUrl(): string {
    const encoded = encodeURIComponent(this.qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encoded}`;
  }

  getPlanGradientStyle(): string {
    const planName = this.user?.plan?.name || 'Bronze';
    switch (planName.toLowerCase()) {
      case 'bronze':
        return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #8B4513 100%)';
      case 'silver':
      case 'prata':
        return 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 30%, #A8A8A8 70%, #808080 100%)';
      case 'gold':
      case 'ouro':
        return 'linear-gradient(135deg, #FFD700 0%, #FFC107 25%, #FF8F00 75%, #E65100 100%)';
      default:
        return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    }
  }

  openTeamModal(): void {
    console.log('Modal do time clicado no profile-qr!');
    this.showTeamModal = true;
    if (this.availableTeams.length === 0 && !this.isLoadingTeams) {
      this.loadTeams();
    }
  }

  closeTeamModal(): void {
    this.showTeamModal = false;
  }

  selectTeam(team: Team): void {
    console.log('ID do time selecionado:', team.id);
    console.log('Dados completos do time:', team);

    if (this.user) {
      this.user.team = {
        name: team.name,
        short_name: team.short_name,
        abbreviation: team.short_name.toUpperCase(),
        shield: team.shield
      };
      const updateData = { team_user: team.id };
      console.log('Enviando atualização para API:', updateData);
      this.authService.updateUser(updateData).subscribe({
        next: (response: unknown) => {
          const res = response as { success: boolean; data?: { user: LocalUser } };
          console.log('Time atualizado com sucesso:', response);
          if (res.success && res.data) {
            this.user = res.data.user;
          }
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar time:', error);
          if (this.user) {
            this.user.team = undefined;
          }
        }
      });
    }

    this.closeTeamModal();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      console.log('📁 Arquivo selecionado:', file.name);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          this.avatarPreview = result;
          console.log('👁️ Preview carregado');
        }
      };
      reader.readAsDataURL(file);

      await this.uploadAvatar(file);
    }
  }

  async uploadAvatar(file: File): Promise<void> {
    try {
      const result = await this.imageUploadService.uploadAvatar(file) as { success: boolean; filePath?: string; error?: string };
      if (result.success) {
        this.avatarPreview = result.filePath || null;
        this.loadUserData();
      } else {
        console.log('❌ Erro no upload:', result.error);
        this.revertAvatarPreview();
      }
    } catch (error: unknown) {
      console.log('💥 Erro inesperado no upload:', error);
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

  // Allow template to trigger the hidden file input using a template ref: #fileInput
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  triggerFileInput(): void {
    // Prefer the template reference variable if present
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
      return;
    }
    // Fallback: try to click the first file input found in the DOM
    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }
}
