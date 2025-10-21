import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-card.component.html',
  styles: ``
})
export class BrandCardComponent {
  @Input() name: string = '';
  @Input() backgroundColor: string = 'bg-red-500';
  @Input() textColor: string = 'text-white';
  @Input() logo: string = '';
  @Input() isLarge: boolean = false;
}

