import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface UploadOptions {
  folder?: string;
  w?: number;
  h?: number;
  fit?: FitMode;
  format?: ImageFormat;
  q?: number;
  type?: string;
  fieldName?: string;
  entityId?: string | number;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  filename?: string;
  url?: string;
  size?: number;
  folder?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  uploadImage(file: File, options: UploadOptions = {}): Observable<UploadResponse> {
    const form = new FormData();
    const field = options.fieldName || 'image';
    form.append(field, file);
    if (options.folder) form.append('folder', options.folder);
    if (options.w !== undefined) form.append('w', String(options.w));
    if (options.h !== undefined) form.append('h', String(options.h));
    if (options.fit) form.append('fit', options.fit);
    if (options.format) form.append('format', options.format);
    if (options.q !== undefined) form.append('q', String(options.q));
    if (options.type) form.append('type', options.type);
    if (options.entityId !== undefined) form.append('entityId', String(options.entityId));
    return this.http.post<UploadResponse>('/upload/image', form);
  }

  uploadAvatar(file: File, options: UploadOptions = {}): Observable<UploadResponse> {
    const form = new FormData();
    form.append('avatar', file);
    if (options.folder) form.append('folder', options.folder);
    if (options.w !== undefined) form.append('w', String(options.w));
    if (options.h !== undefined) form.append('h', String(options.h));
    if (options.fit) form.append('fit', options.fit);
    if (options.format) form.append('format', options.format);
    if (options.q !== undefined) form.append('q', String(options.q));
    if (options.type) form.append('type', options.type);
    if (options.entityId !== undefined) form.append('entityId', String(options.entityId));
    return this.http.post<UploadResponse>('/upload-avatar', form);
  }
}