import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

@Component({
  selector: 'app-tracking-delivery-map',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './tracking-delivery-map.component.html',
  styles: ``
})
export class TrackingDeliveryMapComponent {

   isOpen: boolean = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
