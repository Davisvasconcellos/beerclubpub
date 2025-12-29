import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-despesas-menores-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './despesas-menores-list.component.html',
})
export class DespesasMenoresListComponent {}
