import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-card-description',
  imports: [
    CommonModule,
  ],
  template: `
    <p class="text-sm text-gray-500 dark:text-gray-400">
      <ng-content></ng-content>
    </p>
  `,
  styles: ``
})
export class CardDescriptionComponent {

}
