import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { FileInputComponent } from '../../shared/components/form/input/file-input.component';
import { UploadService, UploadResponse, FitMode, ImageFormat } from '../../services/upload.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-demo',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    ButtonComponent,
    FileInputComponent,
  ],
  templateUrl: './upload-demo.component.html',
  styles: ``
})
export class UploadDemoComponent {
  constructor(private uploadService: UploadService) {}

  // Estado do arquivo selecionado
  selectedFile: File | null = null;
  selectedFileName = '';

  // Parâmetros do upload
  folder = 'user';
  widthStr: string = '';
  heightStr: string = '';
  quality: number = 80;
  fit: FitMode = 'cover';
  format: ImageFormat | '' = ''; // vazio = auto

  // Opções para selects
  fitOptions = [
    { value: 'cover', label: 'cover' },
    { value: 'contain', label: 'contain' },
    { value: 'fill', label: 'fill' },
    { value: 'inside', label: 'inside' },
    { value: 'outside', label: 'outside' },
  ];

  formatOptions = [
    { value: '', label: 'auto (padrão)' },
    { value: 'webp', label: 'webp' },
    { value: 'jpeg', label: 'jpeg' },
    { value: 'png', label: 'png' },
    { value: 'avif', label: 'avif' },
  ];

  // Estado da resposta
  isUploading = false;
  errorMessage = '';
  lastResponse: UploadResponse | null = null;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile = file;
    this.selectedFileName = file ? file.name : '';
    this.errorMessage = '';
    this.lastResponse = null;
  }

  async submitUpload() {
    this.errorMessage = '';
    if (!this.selectedFile) {
      this.errorMessage = 'Selecione um arquivo antes de enviar.';
      return;
    }

    this.isUploading = true;
    try {
      const response = await firstValueFrom(
        this.uploadService.uploadImage(this.selectedFile, {
          folder: this.folder || undefined,
          w: this.widthStr ? Number(this.widthStr) : undefined,
          h: this.heightStr ? Number(this.heightStr) : undefined,
          fit: this.fit || undefined,
          format: this.format || undefined,
          q: this.quality || undefined,
        })
      );
      this.lastResponse = response;
    } catch (err: any) {
      this.errorMessage = err?.message || 'Falha no upload.';
    } finally {
      this.isUploading = false;
    }
  }

  onFitChange(value: string | number) {
    this.fit = String(value) as FitMode;
  }

  onFormatChange(value: string | number) {
    const v = String(value);
    this.format = v ? (v as ImageFormat) : '';
  }
}