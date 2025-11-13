import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blank-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './blank-layout.component.html',
  styles: ``,
  host: {
    class: 'min-h-screen block',
  },
})
export class BlankLayoutComponent {}