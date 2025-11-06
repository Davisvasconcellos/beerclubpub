import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfService, PdfResponse } from '../../../shared/services/pdf.service';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';

@Component({
  selector: 'app-pdf-rich-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, GridShapeComponent],
  templateUrl: './pdf-rich-demo.component.html',
  styles: ``
})
export class PdfRichDemoComponent {
  title = 'Relatório de Exemplo';
  subtitle = 'Documento com layout rico';
  content = 'Este PDF inclui imagem de fundo, formas e cores de marca.\n\nVocê pode personalizar o título, subtítulo, cor de marca e a imagem de fundo.';
  footer = 'Gerado por TailAdmin Utility Server';
  brandColor = '#3b82f6';
  bgImageUrl = '';
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
      const res = await this.pdfService.generateRichPdf({
        title: this.title,
        subtitle: this.subtitle,
        content: this.content,
        footer: this.footer,
        brandColor: this.brandColor,
        bgImageUrl: this.bgImageUrl || undefined,
        format: this.format,
        landscape: this.landscape,
        fileName: 'pdf-rich'
      });
      this.result = res;
      if (res?.url) {
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'Falha ao gerar o PDF rico';
    } finally {
      this.isLoading = false;
    }
  }
}