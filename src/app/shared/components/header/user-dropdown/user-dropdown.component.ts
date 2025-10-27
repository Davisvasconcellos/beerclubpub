import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;
  readonly theme$;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.theme$ = this.themeService.theme$;
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