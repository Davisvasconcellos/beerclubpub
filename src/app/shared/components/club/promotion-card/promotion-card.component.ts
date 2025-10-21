import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-promotion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotion-card.component.html',
  styles: ``
})
export class PromotionCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() discount: string = '';
  @Input() image: string = '';
  @Input() backgroundColor: string = 'bg-orange-500';
  @Input() textColor: string = 'text-white';
}

