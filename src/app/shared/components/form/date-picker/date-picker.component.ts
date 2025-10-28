import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import flatpickr from 'flatpickr';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule,LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``
})
export class DatePickerComponent {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() dateFormat?: string = 'd/m/Y'; // Brazilian format by default
  @Input() position?: 'auto' | 'above' | 'below' | 'auto left' | 'auto center' | 'auto right' | 'above left' | 'above center' | 'above right' | 'below left' | 'below center' | 'below right' = 'auto'; // Position option for calendar placement
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    // Find the closest modal container to append the calendar to
    const modalContainer = this.dateInput.nativeElement.closest('.modal, [role="dialog"], .fixed') as HTMLElement;
    
    // Create flatpickr configuration
    const config: any = {
      mode: this.mode,
      static: false, // Changed to false to allow better positioning
      monthSelectorType: 'static',
      dateFormat: this.dateFormat || 'd/m/Y',
      defaultDate: this.defaultDate,
      position: this.position || 'auto',
      onChange: (selectedDates: any, dateStr: string, instance: any) => {
        this.dateChange.emit({ selectedDates, dateStr, instance });
      }
    };

    // Add appendTo only if modal container is found
    if (modalContainer) {
      config.appendTo = modalContainer;
    }

    // Initialize flatpickr with the input element
    this.flatpickrInstance = (flatpickr as any)(this.dateInput.nativeElement, config);
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
