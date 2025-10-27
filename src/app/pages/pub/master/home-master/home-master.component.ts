import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-home-master',
  imports: [
    CommonModule,
    RouterModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './home-master.component.html',
  styles: ``
})
export class HomeMasterComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}

