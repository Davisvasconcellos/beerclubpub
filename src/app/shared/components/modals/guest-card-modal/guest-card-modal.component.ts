import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../ui/modal/modal.component';
import { Guest } from '../../../interfaces/guest.interface';

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  primaryColor: string;
  secondaryColor: string;
  showLogo: boolean;
  showQRCode: boolean;
  image?: string;
  // Novas propriedades para personalização do cartão
  cardBackgroundType: 'gradient' | 'image';
  cardBackgroundImage?: string;
}

export interface CardSettings {
  backgroundType: 'gradient' | 'image';
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  showLogo: boolean;
  showQRCode: boolean;
}

@Component({
  selector: 'app-guest-card-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './guest-card-modal.component.html',
  styleUrls: ['./guest-card-modal.component.css']
})
export class GuestCardModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() guest: Guest | null = null;
  @Input() event: Event | null = null;
  @Output() close = new EventEmitter<void>();

  cardSettings: CardSettings = {
    backgroundType: 'gradient',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    showLogo: true,
    showQRCode: true
  };

  ngOnInit() {
    if (this.event) {
      this.cardSettings = {
        backgroundType: this.event.cardBackgroundType || 'gradient',
        primaryColor: this.event.primaryColor || '#3B82F6',
        secondaryColor: this.event.secondaryColor || '#8B5CF6',
        backgroundImage: this.event.cardBackgroundImage,
        showLogo: this.event.showLogo !== false,
        showQRCode: this.event.showQRCode !== false
      };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['event'] && this.event) {
      this.cardSettings = {
        backgroundType: this.event.cardBackgroundType || 'gradient',
        primaryColor: this.event.primaryColor || '#3B82F6',
        secondaryColor: this.event.secondaryColor || '#8B5CF6',
        backgroundImage: this.event.cardBackgroundImage,
        showLogo: this.event.showLogo !== false,
        showQRCode: this.event.showQRCode !== false
      };
    }
  }

  onClose() {
    this.close.emit();
  }

  onCardSettingsChange(settings: CardSettings) {
    this.cardSettings = { ...settings };
  }

  getCardBackground(): string {
    const type = this.cardSettings.backgroundType;
    const img = this.cardSettings.backgroundImage || this.event?.cardBackgroundImage;
    const hasImage = !!img;
    const hasColors = !!(this.cardSettings.primaryColor && this.cardSettings.secondaryColor);

    let effective: 'image' | 'gradient' = type;
    if (type === 'image' && !hasImage) {
      effective = hasColors ? 'gradient' : 'image';
    } else if (type === 'gradient' && !hasColors) {
      effective = hasImage ? 'image' : 'gradient';
    }

    if (effective === 'image' && hasImage) {
      return `url('${img}')`;
    }

    const c1 = this.cardSettings.primaryColor || this.event?.primaryColor || '#3B82F6';
    const c2 = this.cardSettings.secondaryColor || this.event?.secondaryColor || '#1E40AF';
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  printCard() {
    if (this.guest && this.event) {
      this.generateCardCanvas().then(canvas => {
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank', 'width=280,height=400');
        if (printWindow) {
          const cardImageUrl = canvas.toDataURL('image/png');
          
          const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Cartão de Acesso - ${this.guest?.name}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                html, body {
                  width: 280px;
                  height: 400px;
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
                .card-image {
                  width: 280px;
                  height: 400px;
                  display: block;
                  border: none;
                  outline: none;
                }
                @media print {
                  * {
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  html, body {
                    width: 280px !important;
                    height: 400px !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  .card-image {
                    width: 280px !important;
                    height: 400px !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                  }
                  @page {
                    size: 280px 400px;
                    margin: 0;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${cardImageUrl}" alt="Cartão de Acesso" class="card-image">
            </body>
            </html>
          `;
          
          printWindow.document.write(printHtml);
          printWindow.document.close();
          printWindow.focus();
          
          // Aguardar a imagem carregar antes de imprimir
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      }).catch(error => {
        console.error('Erro ao gerar canvas do cartão:', error);
      });
    }
  }

  private async generateCardCanvas(): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      try {
        // Dimensões do cartão (280x400px)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto do canvas'));
          return;
        }

        // Configurar dimensões do canvas
        canvas.width = 280;
        canvas.height = 400;

        // Configurar DPI para impressão de qualidade
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 280 * dpr;
        canvas.height = 400 * dpr;
        canvas.style.width = '280px';
        canvas.style.height = '400px';
        ctx.scale(dpr, dpr);

        // Desenhar fundo com gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 280, 400);
        
        // Adicionar border radius visual
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.roundRect(0, 0, 280, 400, 15);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Configurar fonte e cor do texto
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Desenhar nome do evento no topo
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText(this.event?.name || 'Nome do Evento', 140, 40);

        // Desenhar círculo para imagem do convidado
        const centerX = 140;
        const centerY = 140;
        const radius = 50;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();

        // Se houver imagem do convidado, tentar carregá-la
        if (this.guest?.image) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
            ctx.restore();
            this.finishCardCanvas(ctx, canvas, resolve);
          };
          img.onerror = () => {
            this.drawInitials(ctx, centerX, centerY, radius);
            this.finishCardCanvas(ctx, canvas, resolve);
          };
          img.src = this.guest.image;
        } else {
          this.drawInitials(ctx, centerX, centerY, radius);
          this.finishCardCanvas(ctx, canvas, resolve);
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  private drawInitials(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    const initials = this.getInitials(this.guest?.name || '');
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, centerX, centerY);
  }

  private finishCardCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, resolve: (canvas: HTMLCanvasElement) => void) {
    // Desenhar nome do convidado
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText(this.guest?.name || 'Nome do Convidado', 140, 220);

    // Desenhar QR Code
    this.drawQRCode(ctx, 140, 320);

    resolve(canvas);
  }

  private drawQRCode(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
    const qrSize = 64;
    const moduleSize = 2;
    const startX = centerX - qrSize / 2;
    const startY = centerY - qrSize / 2;

    // Fundo branco do QR code
    ctx.fillStyle = 'white';
    ctx.fillRect(startX, startY, qrSize, qrSize);

    // Desenhar módulos do QR code
    ctx.fillStyle = 'black';

    // Quadrados de posicionamento (cantos)
    this.drawPositionSquare(ctx, startX + 2, startY + 2);
    this.drawPositionSquare(ctx, startX + qrSize - 16, startY + 2);
    this.drawPositionSquare(ctx, startX + 2, startY + qrSize - 16);

    // Padrões de timing
    for (let i = 18; i < qrSize - 18; i += 4) {
      ctx.fillRect(startX + i, startY + 6, moduleSize, moduleSize);
      ctx.fillRect(startX + 6, startY + i, moduleSize, moduleSize);
    }

    // Módulos de dados (padrão simulado)
    const dataPattern = [
      [18, 18], [22, 18], [26, 20], [30, 18], [34, 20], [38, 18], [42, 20], [46, 18], [50, 20],
      [18, 22], [20, 24], [24, 22], [28, 24], [32, 22], [36, 24], [40, 22], [44, 24], [48, 22], [52, 24],
      [18, 26], [22, 28], [26, 26], [30, 28], [34, 26], [38, 28], [42, 26], [46, 28], [50, 26],
      [20, 30], [24, 32], [28, 30], [32, 32], [36, 30], [40, 32], [44, 30], [48, 32], [52, 30],
      [18, 40], [22, 42], [26, 40], [30, 42], [34, 40], [38, 42], [42, 44], [46, 46], [50, 44],
      [20, 44], [24, 46], [28, 44], [32, 46], [36, 44], [40, 46], [44, 48], [48, 50], [52, 48],
      [18, 48], [22, 50], [26, 48], [30, 50], [34, 48], [38, 50],
      [20, 52], [24, 54], [28, 52], [32, 54], [36, 52]
    ];

    dataPattern.forEach(([x, y]) => {
      if (x < qrSize - 2 && y < qrSize - 2) {
        ctx.fillRect(startX + x, startY + y, moduleSize, moduleSize);
      }
    });
  }

  private drawPositionSquare(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Quadrado externo
    ctx.fillRect(x, y, 14, 14);
    // Quadrado interno branco
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 2, y + 2, 10, 10);
    // Quadrado central preto
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 4, y + 4, 6, 6);
  }

  private generateCardHTML(): string {
    if (!this.guest || !this.event) return '';

    const backgroundStyle = this.cardSettings.backgroundType === 'image' && this.cardSettings.backgroundImage
      ? `background-image: url('${this.cardSettings.backgroundImage}'); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, ${this.cardSettings.primaryColor || '#3B82F6'}, ${this.cardSettings.secondaryColor || '#1E40AF'});`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cartão de Acesso - ${this.guest.name}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
          }
          .card {
            width: 340px;
            height: 215px;
            ${backgroundStyle}
            border-radius: 15px;
            padding: 20px;
            color: white;
            position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            margin: 0 auto;
          }
          .event-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }
          .guest-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
          }
          .guest-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }
          .guest-email {
            font-size: 12px;
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }
          .qr-code {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            font-size: 10px;
          }
          .logo {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          @media print {
            body { background: white; }
            .card { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          ${this.cardSettings.showLogo ? '<div class="logo">LOGO</div>' : ''}
          <div class="event-name">${this.event.name}</div>
          <div class="guest-info">
            <div class="guest-name">${this.guest.name}</div>
            <div class="guest-email">${this.guest.email}</div>
          </div>
          ${this.cardSettings.showQRCode ? '<div class="qr-code">QR CODE</div>' : ''}
        </div>
      </body>
      </html>
    `;
  }
}