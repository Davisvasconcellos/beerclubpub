import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;
  isLoading = false;
  errorMessage = '';

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso:', response);
        this.isLoading = false;
        
        // Redireciona baseado no papel do usuário
        const user = this.authService.getCurrentUser();
        if (user) {
          switch (user.role) {
            case 'admin':
              this.router.navigate(['/pub/admin']);
              break;
            case 'master':
              this.router.navigate(['/pub/master']);
              break;
            case 'waiter':
              this.router.navigate(['/pub/waiter']);
              break;
            case 'customer':
              this.router.navigate(['/pub/user']); // Customer usa home-user
              break;
            case 'manager':
              this.router.navigate(['/pub/user']); // Manager também usa home-user por enquanto
              break;
            default:
              this.router.navigate(['/']);
              break;
          }
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Erro ao fazer login:', error);
        this.isLoading = false;
        this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
      }
    });
  }
}
