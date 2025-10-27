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
  showConfirmPassword = false;
  isChecked = false;
  isLoading = false;
  errorMessage = '';

  fname = '';
  lname = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isPasswordValid(): boolean {
    return this.password.length >= 6 && 
           this.hasNumber(this.password) && 
           this.hasLetter(this.password);
  }

  hasNumber(str: string): boolean {
    return /\d/.test(str);
  }

  hasLetter(str: string): boolean {
    return /[a-zA-Z]/.test(str);
  }

  onSignUp() {
    // Reset error message
    this.errorMessage = '';
    
    // Basic validation
    if (!this.fname.trim() || !this.lname.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Password validation
    if (!this.isPasswordValid()) {
      this.errorMessage = 'Password must be at least 6 characters long and contain both numbers and letters';
      return;
    }

    // Password confirmation validation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Checkbox validation
    if (!this.isChecked) {
      this.errorMessage = 'You must agree to the Terms and Conditions';
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
