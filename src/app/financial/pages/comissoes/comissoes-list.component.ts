import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-comissoes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './comissoes-list.component.html',
})
export class ComissoesListComponent {}
