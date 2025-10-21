import { Component } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-add-api-key-modal',
  imports: [
    ModalComponent,
    InputFieldComponent,
    LabelComponent,
    ButtonComponent
  ],
  templateUrl: './add-api-key-modal.component.html',
  styles: ``
})
export class AddApiKeyModalComponent {
  isOpen = false;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }
}
