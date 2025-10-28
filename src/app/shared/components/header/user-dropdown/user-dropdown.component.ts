import { Component, OnInit, HostListener } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { ThemeService } from '../../../services/theme.service';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  readonly theme$;
  user: User | null = null;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.theme$ = this.themeService.theme$;
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.relative');
    if (!dropdown && this.isOpen) {
      this.closeDropdown();
    }
  }

  loadUserData(): void {
    // Primeiro, tenta obter o usuário do cache
    this.user = this.authService.getCurrentUser();

    // Depois, busca dados atualizados da API
    this.authService.getUserMe().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data.user;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
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
      status: 'active'
    };
  }

  get userAvatar(): string {
    return this.user?.avatar || this.user?.avatar_url || '/images/user/default-avatar.jpg';
  }

  get userName(): string {
    return this.user?.name || 'Usuário';
  }

  get userEmail(): string {
    return this.user?.email || 'usuario@email.com';
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout(): void {
    // Redirecionar para a rota /signout que fará o logout completo
    this.closeDropdown();
    this.router.navigate(['/signout']);
  }

  goHome(): void {
    this.closeDropdown();
    this.router.navigate(['/']);
  }
}