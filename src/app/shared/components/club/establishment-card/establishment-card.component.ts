import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-establishment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './establishment-card.component.html',
  styles: ``
})
export class EstablishmentCardComponent {
  @Input() name: string = '';
  @Input() category: string = '';
  @Input() distance: string = '';
  @Input() deliveryTime: string = '';
  @Input() rating: string | undefined = undefined;
  @Input() deliveryFee: string | undefined = undefined;
  @Input() isFreeDelivery: boolean = false;
  @Input() icon: string | undefined = undefined;
  @Input() iconColor: string = 'bg-green-500';
}
