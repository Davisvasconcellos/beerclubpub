import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../../services/auth.service';


@Component({
  selector: 'app-signup-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {

  showPassword = false;
  isChecked = false;
  isLoading = false;
  errorMessage = '';

  fname = '';
  lname = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    // Reset error message
    this.errorMessage = '';
    
    // Basic validation
    if (!this.fname.trim() || !this.lname.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Todos os campos são obrigatórios.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequest = {
      name: `${this.fname.trim()} ${this.lname.trim()}`,
      email: this.email.trim(),
      password: this.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Redirect based on user role
        const userRole = response.data.user.role;
        if (userRole === 'admin' || userRole === 'master' || userRole === 'manager') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/pub/user']);
        }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}
