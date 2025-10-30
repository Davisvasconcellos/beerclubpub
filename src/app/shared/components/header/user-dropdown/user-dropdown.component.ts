import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule]
})
export class UserDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  readonly theme$;
  user: User | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.theme$ = this.themeService.theme$;
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToUserChanges();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.relative');
    if (!dropdown && this.isOpen) {
      this.closeDropdown();
    }
  }

  subscribeToUserChanges(): void {
    // Se inscrever no Observable do AuthService para receber atualizações automáticas
    this.userSubscription.add(
      this.authService.currentUser$.subscribe({
        next: (user) => {
          this.user = user;
          console.log('🔄 Header avatar atualizado:', user?.avatar_url);
        },
        error: (error) => {
          console.error('Erro ao receber atualização do usuário:', error);
        }
      })
    );
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

  onAvatarError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = '/images/user/default-avatar.jpg';
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