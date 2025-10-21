import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styles: ``
})
export class ProductCardComponent {
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() originalPrice: string = '';
  @Input() discountedPrice: string = '';
  @Input() discount: string = '';
  @Input() quantity: string = '';
  @Input() image: string = '';
}

