import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
}

export interface UploadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private readonly defaultOptions: ImageProcessingOptions = {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
    format: 'jpeg'
  };

  private readonly utilityServerUrl = 'http://localhost:3001'; // Frontend Utility Server

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  /**
   * Processa e faz upload de uma imagem de avatar
   */
  async uploadAvatar(file: File): Promise<UploadResult> {
    try {
      console.log('🚀 Iniciando upload do avatar:', file.name);
      
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Obter dados do usuário
      const user = this.authService.getCurrentUser();
      if (!user || !user.id_code) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Processar imagem
      const processedBlob = await this.processImage(file, this.defaultOptions);
      
      // Gerar nome do arquivo
      const fileName = this.generateFileName(user.id_code, this.defaultOptions.format!);
      
      // Remover avatar antigo se existir
      if (user.avatar_url) {
        await this.removeOldAvatar(user.avatar_url);
      }

      // Salvar arquivo localmente
      const filePath = await this.saveToLocal(processedBlob, fileName);
      
      // Extrair o nome real do arquivo do caminho retornado pelo servidor
      const actualFileName = filePath.split('/').pop() || fileName;
      
      // Atualizar avatar do usuário via API
      const updateResult = await this.updateUserAvatar(actualFileName);
      if (!updateResult.success) {
        console.warn('⚠️ Aviso: Arquivo salvo mas API não foi atualizada:', updateResult.error);
      }
      
      console.log('✅ Upload concluído com sucesso:', fileName);
      console.log('📁 Arquivo salvo em:', filePath);
      
      return {
        success: true,
        fileName: actualFileName,
        filePath
      };

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Valida o arquivo de entrada
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato não suportado. Use apenas JPEG ou PNG.'
      };
    }

    // Verificar tamanho (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'Arquivo muito grande. Máximo 5MB.' 
      };
    }

    return { valid: true };
  }

  /**
   * Processa a imagem: redimensiona e comprime
   */
  private async processImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calcular dimensões mantendo proporção
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            options.maxWidth!, 
            options.maxHeight!
          );

          // Configurar canvas
          canvas.width = width;
          canvas.height = height;

          // Desenhar imagem redimensionada
          ctx!.drawImage(img, 0, 0, width, height);

          // Converter para blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`📏 Imagem processada: ${width}x${height}, ${(blob.size / 1024).toFixed(1)}KB`);
                resolve(blob);
              } else {
                reject(new Error('Falha ao processar imagem'));
              }
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calcula dimensões mantendo proporção
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Redimensionar se necessário
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Gera nome único para o arquivo
   */
  private generateFileName(idCode: string, format: string): string {
    const timestamp = Date.now();
    return `${idCode}_${timestamp}.${format}`;
  }

  /**
   * Salva arquivo na pasta local
   */
  private async saveToLocal(blob: Blob, fileName: string): Promise<string> {
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      const file = new File([blob], fileName, { type: blob.type });
      formData.append('avatar', file);

      console.log('📤 Enviando arquivo para servidor local:', fileName);

      // Fazer upload para o servidor utilitário
      const response = await this.http.post<any>(`${this.utilityServerUrl}/upload-avatar`, formData).toPromise();

      if (response.success) {
        console.log('✅ Arquivo salvo com sucesso no servidor:', response.path);
        return response.path;
      } else {
        throw new Error(response.message || 'Erro no upload');
      }

    } catch (error) {
      console.error('❌ Erro ao salvar arquivo:', error);
      throw new Error(`Falha ao salvar arquivo: ${error}`);
    }
  }

  /**
   * Remove avatar antigo
   */
  private async removeOldAvatar(oldAvatarUrl: string): Promise<void> {
    try {
      if (oldAvatarUrl && oldAvatarUrl !== 'images/user/default-avatar.jpg') {
        console.log(`🗑️ Removendo avatar antigo: ${oldAvatarUrl}`);
        // Em produção, aqui seria uma chamada para remover o arquivo físico
      }
    } catch (error) {
      console.warn('Aviso: Não foi possível remover avatar antigo:', error);
    }
  }

  /**
   * Remove arquivo específico
   */
  private async removeFile(filePath: string): Promise<void> {
    try {
      console.log(`🗑️ Removendo arquivo: ${filePath}`);
      // Em produção, aqui seria uma chamada para remover o arquivo físico
    } catch (error) {
      console.warn('Aviso: Não foi possível remover arquivo:', error);
    }
  }

  /**
   * Atualiza avatar via API
   */
  private async updateUserAvatar(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const avatarUrl = `images/user/${fileName}`;
      
      console.log('🔄 Atualizando avatar via API:', avatarUrl);
      
      const result = await this.authService.updateUser({ avatar_url: avatarUrl }).toPromise();
      
      if (result) {
        console.log('✅ API atualizada com sucesso');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida da API' };
      }
    } catch (error) {
      console.error('❌ Erro na API:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro na API' 
      };
    }
  }

  /**
   * Processa múltiplas imagens (para uso futuro)
   */
  async processMultipleImages(
    files: FileList, 
    options?: ImageProcessingOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const processingOptions = { ...this.defaultOptions, ...options };

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadAvatar(files[i]);
      results.push(result);
    }

    return results;
  }

  /**
   * Obtém informações de uma imagem
   */
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };
      
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }
}