import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../ui/modal/modal.component';

@Component({
  selector: 'app-add-event-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalComponent],
  templateUrl: './add-event-modal.component.html',
})
export class AddEventModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<{
    name: string;
    slug: string;
    banner_url: string;
    start_datetime: string;
    end_datetime: string;
    description: string;
    place: string;
    resp_email: string;
    resp_name: string;
    resp_phone: string;
    color_1: string;
    color_2: string;
  }>();

  name: string = '';
  slug: string = '';
  slugTouched: boolean = false;
  bannerUrl: string = '';
  startDatetime: string = '';
  endDatetime: string = '';
  description: string = '';
  place: string = '';
  respEmail: string = '';
  respName: string = '';
  respPhone: string = '';
  color1: string = '#343434';
  color2: string = '#f5f5f5';

  onSubmit() {
    if (this.name && this.slug && this.startDatetime && this.endDatetime) {
      const payload = {
        name: this.name,
        slug: this.slug,
        banner_url: this.normalizeBannerUrl(this.bannerUrl),
        start_datetime: this.toIsoWithZ(this.startDatetime),
        end_datetime: this.toIsoWithZ(this.endDatetime),
        description: this.description,
        place: this.place,
        resp_email: this.respEmail,
        resp_name: this.respName,
        resp_phone: this.respPhone,
        color_1: this.color1,
        color_2: this.color2,
      };

      this.saveEvent.emit(payload);
      this.close.emit();
      this.resetForm();
    }
  }

  onNameInput() {
    if (!this.slugTouched) {
      this.slug = this.slugify(this.name);
    }
  }

  onStartDateChange() {
    // Se a data de fim é anterior à nova data de início, limpar a data de fim
    if (this.endDatetime && new Date(this.endDatetime) < new Date(this.startDatetime)) {
      this.endDatetime = '';
    }
  }

  onEndDateChange() {
    // Se a data de fim é anterior à data de início, ajustar para a data de início
    if (this.endDatetime && new Date(this.endDatetime) < new Date(this.startDatetime)) {
      this.endDatetime = this.startDatetime;
    }
  }

  resetForm() {
    this.name = '';
    this.slug = '';
    this.slugTouched = false;
    this.bannerUrl = '';
    this.startDatetime = '';
    this.endDatetime = '';
    this.description = '';
    this.place = '';
    this.respEmail = '';
    this.respName = '';
    this.respPhone = '';
    this.color1 = '#343434';
    this.color2 = '#f5f5f5';
  }

  private toIsoWithZ(local: string): string {
    // datetime-local retorna sem timezone. Interpretamos como local e adicionamos 'Z' para UTC.
    try {
      const d = new Date(local);
      if (!isNaN(d.getTime())) return new Date(d.getTime()).toISOString().replace(/\.\d{3}Z$/, 'Z');
      return local;
    } catch {
      return local;
    }
  }

  private slugify(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeBannerUrl(url: string): string {
    const clean = (url || '').trim().replace(/[`'\"]/g, '');
    if (!clean) return '';
    if (/^https?:\/\//.test(clean)) return clean;
    if (!clean.startsWith('/')) return `/images/cards/${clean}`;
    return clean;
  }
}