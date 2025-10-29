import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  template: `
    <div class="relative w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <!-- Tela de Loading -->
      <div *ngIf="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-30">
        <div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
        <p class="mt-4 text-lg font-semibold">Verificando dados do cliente...</p>
      </div>

      <!-- Seletor de Câmera -->
      <div *ngIf="availableDevices.length > 1" class="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-black/30 p-2 rounded-lg">
        <p class="text-sm font-bold text-center">Trocar Câmera</p>
        <button *ngFor="let device of availableDevices" (click)="selectCamera(device)" 
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
          {{ device.label }}
        </button>
      </div>

      <!-- Visualizador da Câmera -->
      <div class="w-full max-w-lg relative" [class.hidden]="isLoading">
        <div class="absolute inset-0 border-8 border-blue-500 rounded-lg opacity-50 z-10"></div>
        <zxing-scanner 
          [formats]="allowedFormats"
          [device]="selectedDevice"
          (scanSuccess)="onScanSuccess($event)"
          (camerasFound)="onCamerasFound($event)"
          (scanError)="onScanError($event)">
        </zxing-scanner>
      </div>

      <div class="mt-6 text-center z-10">
        <h2 class="text-2xl font-bold">Aponte para o QR Code</h2>
        <p class="text-gray-300 mt-2">O leitor iniciará automaticamente.</p>
        <button (click)="goBack()" class="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors" [disabled]="isLoading">
          Cancelar
        </button>
      </div>
    </div>
  `,
})
export class QrScannerComponent implements OnDestroy {
  isLoading = false;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  allowedFormats = [BarcodeFormat.QR_CODE];

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    // O componente zxing-scanner gerencia a câmera internamente
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    // Prioriza a câmera traseira ('environment') se disponível
    const rearCamera = devices.find(device => /back|rear|environment/i.test(device.label));
    this.selectedDevice = rearCamera || devices[0];
  }

  onScanSuccess(scannedData: string): void {
    if (scannedData && !this.isLoading) {
      console.log('✅ QR Code lido com sucesso:', scannedData);
      this.isLoading = true;

      setTimeout(() => {
        this.router.navigate(['/check-user-status'], { queryParams: { id_code: scannedData } });
      }, 2000);
    }
  }

  onScanError(error: Error): void {
    console.error('❌ Erro no scanner:', error);
  }

  selectCamera(device: MediaDeviceInfo): void {
    this.selectedDevice = device;
  }

  goBack(): void {
    this.router.navigate(['/pub/waiter']);
  }
}
