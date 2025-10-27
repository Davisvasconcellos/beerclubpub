import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-home-waiter',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-waiter.component.html',
  styleUrl: './home-waiter.component.css'
})
export class HomeWaiterComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
