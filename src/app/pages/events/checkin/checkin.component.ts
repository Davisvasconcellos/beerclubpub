import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, ApiGuest } from '../event.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { AuthService } from '../../../shared/services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { ImageUploadService } from '../../../shared/services/image-upload.service';

@Component({
  selector: 'app-event-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputFieldComponent],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit, OnDestroy {
  idCode = '';
  displayName = '';
  email = '';
  phone = '';
  selfieUrl = '';
  uploadingSelfie = false;
  cameraLoading = false;
  submitting = false;
  submitError = '';
  submitSuccess = false;
  nameError = false;

  // Evento
  eventName: string = '';
  eventBannerUrl: string = '';

  // Câmera
  cameraOpen = false;
  mediaStream: MediaStream | null = null;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private themeService: ThemeService,
    private imageUploadService: ImageUploadService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Força tema escuro para esta rota
    this.themeService.setTheme('dark');

    // Prefill com dados do usuário autenticado
    const user = this.authService.getCurrentUser();
    if (user) {
      this.displayName = user.name || '';
      this.email = user.email || '';
      this.phone = user.phone || '';
    }

    this.route.paramMap.subscribe(pm => {
      this.idCode = pm.get('id_code') || '';
      if (this.idCode) {
        this.loadEventDetails(this.idCode);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private loadEventDetails(idCode: string): void {
    // Usa o endpoint público para exibir card/banner sem exigir autenticação
    this.eventService.getPublicEventByIdCodeDetail(idCode).subscribe({
      next: (res: any) => {
        const ev = res?.event || res;
        this.eventName = ev?.title || ev?.name || '';
        this.eventBannerUrl = ev?.banner_url || ev?.image || '';
      },
      error: () => {
        // Silencioso: banner/nome são complementares
      }
    });
  }

  onNameChange(value: string | number): void {
    this.displayName = String(value);
    this.nameError = !this.displayName?.trim();
  }

  onEmailChange(value: string | number): void {
    this.email = String(value);
  }

  onPhoneChange(value: string | number): void {
    this.phone = String(value);
  }

  onSubmit(): void {
    if (!this.idCode) return;
    this.nameError = !this.displayName?.trim();
    if (this.nameError) {
      this.submitError = 'Por favor, informe como prefere ser chamado.';
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.eventService.postEventCheckin(this.idCode, {
      display_name: this.displayName || undefined,
      email: this.email || undefined,
      phone: this.phone || undefined,
      selfie_url: this.selfieUrl || undefined,
      document: null
    }).subscribe({
      next: ({ guest, checked_in }) => {
        this.submitting = false;
        this.submitSuccess = checked_in;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (checked_in) {
          // Se veio de um fluxo guardado, seguir para a página original
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate([`/events/answer/${this.idCode}`]);
          }
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || 'Falha ao realizar check-in.';
      }
    });
  }

  // ---- Selfie com câmera ----
  async triggerCamera(): Promise<void> {
    await this.startCamera();
  }

  private async startCamera(): Promise<void> {
    try {
      this.cameraOpen = true;
      this.cameraLoading = true;
      this.cdr.detectChanges();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      const videoEl = this.videoRef?.nativeElement;
      if (videoEl && this.mediaStream) {
        videoEl.srcObject = this.mediaStream;
        // Em alguns dispositivos (iOS), é necessário mutar para permitir autoplay
        videoEl.muted = true;
        await videoEl.play();
        this.cameraLoading = false;
        this.cdr.detectChanges();
      }
    } catch (err) {
      this.cameraOpen = false;
      this.cameraLoading = false;
      this.cdr.detectChanges();
      this.submitError = 'Não foi possível acessar a câmera.';
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    this.cameraOpen = false;
  }

  async captureSelfie(): Promise<void> {
    const videoEl = this.videoRef?.nativeElement;
    const canvasEl = this.canvasRef?.nativeElement;
    if (!videoEl || !canvasEl || !this.idCode) return;

    // Ajusta canvas ao tamanho do vídeo e desenha o frame atual
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    // Preview imediato para evitar sensação de travamento
    try {
      this.selfieUrl = canvasEl.toDataURL('image/jpeg', 0.9);
      this.uploadingSelfie = true;
      this.cdr.detectChanges();
    } catch {}

    // Fecha a câmera imediatamente após capturar o frame
    this.stopCamera();

    // Converte para Blob e faz upload
    canvasEl.toBlob(async (blob) => {
      if (!blob) {
        this.submitError = 'Não foi possível capturar a imagem.';
        return;
      }
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      try {
        const res = await this.imageUploadService.uploadImage(file, 'event-selfie', this.idCode);
        if (res.success && res.filePath) {
          this.selfieUrl = res.filePath;
        } else {
          this.submitError = res.error || 'Falha ao enviar selfie.';
        }
      } catch (err: any) {
        this.submitError = err?.message || 'Erro ao processar selfie.';
      } finally {
        this.uploadingSelfie = false;
        this.cdr.detectChanges();
      }
    }, 'image/jpeg', 0.9);
  }
}