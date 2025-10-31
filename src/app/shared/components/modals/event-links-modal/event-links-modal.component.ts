import { Component, Input, Output, EventEmitter } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { ModalComponent } from '../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';
import { EventLink } from '../../../../pages/events/event-list-admin/event-list-admin.component';

@Component({
  selector: 'app-event-links-modal',
  standalone: true,
  imports: [QRCodeComponent, ModalComponent, CommonModule],
  templateUrl: './event-links-modal.component.html',
})
export class EventLinksModalComponent {
  @Input() eventLinks: EventLink[] = [];
  @Input() qrCodeData: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // alert('Link copiado para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar o link: ', err);
    });
  }
}
