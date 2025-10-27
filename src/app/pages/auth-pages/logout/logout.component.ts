import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 text-indigo-600">
            <svg class="animate-spin h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Fazendo logout...
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Aguarde enquanto encerramos sua sessão com segurança.
          </p>
          <div class="mt-4">
            <div class="bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" [style.width.%]="progress"></div>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Redirecionando em {{ remainingTime }}s...
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LogoutComponent implements OnInit {
  progress = 0;
  remainingTime = 5;
  private readonly TIMEOUT_SECONDS = 5;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.performLogout();
    this.startProgressTimer();
  }

  private performLogout(): void {
    // Inicia o processo de logout
    this.authService.logout().subscribe({
      next: () => {
        // Logout bem-sucedido, redireciona imediatamente
        this.redirectToSignin();
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, limpa dados locais e redireciona
        this.authService['localStorageService'].clearAuthData();
        this.authService['currentUserSubject'].next(null);
        this.authService['isAuthenticatedSubject'].next(false);
        this.redirectToSignin();
      }
    });
  }

  private startProgressTimer(): void {
    // Timer de segurança - redireciona após 5 segundos independente da API
    const interval = 100; // Atualiza a cada 100ms
    const totalSteps = (this.TIMEOUT_SECONDS * 1000) / interval;
    let currentStep = 0;

    const progressTimer = timer(0, interval).subscribe(() => {
      currentStep++;
      this.progress = (currentStep / totalSteps) * 100;
      this.remainingTime = Math.ceil((totalSteps - currentStep) * interval / 1000);

      if (currentStep >= totalSteps) {
        progressTimer.unsubscribe();
        // Força o redirecionamento após o timeout
        this.redirectToSignin();
      }
    });
  }

  private redirectToSignin(): void {
    this.router.navigate(['/signin']);
  }
}