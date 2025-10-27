import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-home-customer',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-customer.component.html',
  styleUrl: './home-customer.component.css'
})
export class HomeCustomerComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}