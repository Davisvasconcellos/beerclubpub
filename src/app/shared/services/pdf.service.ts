import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SimplePdfPayload {
  title?: string;
  content?: string;
  footer?: string;
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  landscape?: boolean;
  fileName?: string;
}

export interface PdfResponse {
  success: boolean;
  message?: string;
  filename?: string;
  url?: string;
  size?: number;
}

export interface RichPdfPayload {
  title?: string;
  subtitle?: string;
  content?: string;
  footer?: string;
  brandColor?: string; // hex color
  bgImageUrl?: string; // absolute URL
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  landscape?: boolean;
  fileName?: string;
}

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private http: HttpClient) {}

  async generateSimplePdf(payload: SimplePdfPayload): Promise<PdfResponse> {
    const response$ = this.http.post<PdfResponse>('/pdf/simple', payload);
    return await firstValueFrom(response$);
  }

  async generateRichPdf(payload: RichPdfPayload): Promise<PdfResponse> {
    const response$ = this.http.post<PdfResponse>('/pdf/rich', payload);
    return await firstValueFrom(response$);
  }
}