// AppHeaderComponent
import { Component, ElementRef, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownComponent } from '../../components/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../components/ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationDropdownComponent,
    UserDropdownComponent,
    TranslateModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  readonly isMobileOpen$;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  currentLang: 'pt-br' | 'en' = 'pt-br';

  isLangOpen = false;

  languages: Array<{ code: 'pt-br' | 'en'; label: string; flag: string }> = [
    { code: 'pt-br', label: 'Português (Brasil)', flag: '/images/flags/brazil.svg' },
    { code: 'en', label: 'English (US)', flag: '/images/flags/united-states.svg' },
  ];

  get currentFlag(): string {
    return this.languages.find(l => l.code === this.currentLang)?.flag ?? '/images/flags/brazil.svg';
  }

  constructor(public sidebarService: SidebarService, private translate: TranslateService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.currentLang = (localStorage.getItem('lang') as 'pt-br' | 'en') || 'pt-br';
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };

  toggleLangDropdown(): void {
    this.isLangOpen = !this.isLangOpen;
  }

  closeLangDropdown(): void {
    this.isLangOpen = false;
  }

  changeLanguage(lang: 'pt-br' | 'en'): void {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    this.isLangOpen = false;
  }
}
