import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SafeHtmlPipe } from '../../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-label-list',
  imports: [
    CommonModule,
    SafeHtmlPipe,
  ],
  templateUrl: './label-list.component.html',
  styles: ``
})
export class LabelListComponent {

  activeItem: string = '';

  labelItems = [
    { name: "Personal", key: "personal", count: "", icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.7567 3.89683C11.6331 3.72282 11.4696 3.58089 11.28 3.48289C11.0904 3.3849 10.8801 3.33367 10.6667 3.3335L3.33333 3.34016C2.59667 3.34016 2 3.93016 2 4.66683V11.3335C2 12.0702 2.59667 12.6602 3.33333 12.6602L10.6667 12.6668C11.1167 12.6668 11.5133 12.4435 11.7567 12.1035L14.6667 8.00016L11.7567 3.89683Z" fill="#12B76A"/>
  </svg>` },
    { name: "Work", key: "work", icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.7567 3.89683C11.6331 3.72282 11.4696 3.58089 11.28 3.48289C11.0904 3.3849 10.8801 3.33367 10.6667 3.3335L3.33333 3.34016C2.59667 3.34016 2 3.93016 2 4.66683V11.3335C2 12.0702 2.59667 12.6602 3.33333 12.6602L10.6667 12.6668C11.1167 12.6668 11.5133 12.4435 11.7567 12.1035L14.6667 8.00016L11.7567 3.89683Z" fill="#F04438"/>
  </svg>` },
    { name: "Payments", key: "draft", icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    xmlns="http://www.w3.org/2000/svg"> <path d="M11.7567 3.89683C11.6331 3.72282 11.4696 3.58089 11.28 3.48289C11.0904 3.3849 10.8801 3.33367 10.6667 3.3335L3.33333 3.34016C2.59667 3.34016 2 3.93016 2 4.66683V11.3335C2 12.0702 2.59667 12.6602 3.33333 12.6602L10.6667 12.6668C11.1167 12.6668 11.5133 12.4435 11.7567 12.1035L14.6667 8.00016L11.7567 3.89683Z" fill="#FD853A"/>
  </svg>` },
    { name: "Invoices", key: "invoices", icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7567 3.89683C11.6331 3.72282 11.4696 3.58089 11.28 3.48289C11.0904 3.3849 10.8801 3.33367 10.6667 3.3335L3.33333 3.34016C2.59667 3.34016 2 3.93016 2 4.66683V11.3335C2 12.0702 2.59667 12.6602 3.33333 12.6602L10.6667 12.6668C11.1167 12.6668 11.5133 12.4435 11.7567 12.1035L14.6667 8.00016L11.7567 3.89683Z" fill="#36BFFA"/>
  </svg>` },
    { name: "Blank", key: "blank", icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    xmlns="http://www.w3.org/2000/svg"> <path d="M11.7567 3.89683C11.6331 3.72282 11.4696 3.58089 11.28 3.48289C11.0904 3.3849 10.8801 3.33367 10.6667 3.3335L3.33333 3.34016C2.59667 3.34016 2 3.93016 2 4.66683V11.3335C2 12.0702 2.59667 12.6602 3.33333 12.6602L10.6667 12.6668C11.1167 12.6668 11.5133 12.4435 11.7567 12.1035L14.6667 8.00016L11.7567 3.89683Z" fill="#6172F3"/>
  </svg>` },
  ];

  setActiveItem(key: string) {
    this.activeItem = key;
  }
}
