import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService, PdfResponse } from '../../../shared/services/pdf.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-demo.component.html',
  styles: ``
})
export class PdfDemoComponent {
  title = 'Documento de Exemplo';
  content = 'Este é um PDF simples gerado via servidor utilitário.';
  footer = 'Gerado por TailAdmin Utility Server';
  format: 'A4' | 'A3' | 'Letter' | 'Legal' = 'A4';
  landscape = false;

  isLoading = false;
  errorMessage: string | null = null;
  result: PdfResponse | null = null;
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(private pdfService: PdfService, private sanitizer: DomSanitizer) {}

  async generate() {
    this.isLoading = true;
    this.errorMessage = null;
    this.result = null;
    this.safePdfUrl = null;
    try {
      const res = await this.pdfService.generateSimplePdf({
        title: this.title,
        content: this.content,
        footer: this.footer,
        format: this.format,
        landscape: this.landscape,
        fileName: 'pdf-simples'
      });
      this.result = res;
      if (res?.url) {
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'Falha ao gerar o PDF';
    } finally {
      this.isLoading = false;
    }
  }
}