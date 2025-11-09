import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { FileInputComponent } from '../../form/input/file-input.component';

export interface CardSettings {
  backgroundType: 'gradient' | 'image';
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  showLogo: boolean;
  showQRCode: boolean;
}

@Component({
  selector: 'app-card-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelComponent, FileInputComponent],
  templateUrl: './card-settings.component.html',
  styleUrls: ['./card-settings.component.css']
})
export class CardSettingsComponent {
  @Input() settings: CardSettings = {
    backgroundType: 'gradient',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    showLogo: true,
    showQRCode: true
  };
  
  @Output() settingsChange = new EventEmitter<CardSettings>();
  @Output() backgroundImageFileChange = new EventEmitter<File | null>();

  onBackgroundTypeChange(type: 'gradient' | 'image') {
    this.settings.backgroundType = type;
    this.emitChanges();
  }

  onColorChange(colorType: 'primary' | 'secondary', color: string) {
    if (colorType === 'primary') {
      this.settings.primaryColor = color;
    } else {
      this.settings.secondaryColor = color;
    }
    this.emitChanges();
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Emitir o arquivo selecionado para o componente pai
      this.backgroundImageFileChange.emit(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.settings.backgroundImage = e.target?.result as string;
        this.emitChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onToggleChange(option: 'showLogo' | 'showQRCode', value: boolean) {
    this.settings[option] = value;
    this.emitChanges();
  }

  private emitChanges() {
    this.settingsChange.emit({ ...this.settings });
  }
}