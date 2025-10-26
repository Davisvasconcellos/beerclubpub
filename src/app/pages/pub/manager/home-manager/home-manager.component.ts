import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-home-manager',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-manager.component.html',
  styleUrl: './home-manager.component.css'
})
export class HomeManagerComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redireciona para login
        this.router.navigate(['/signin']);
      }
    });
  }
}