import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private readonly API_BASE_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Busca endereço pelo CEP usando a API do ViaCEP
   * @param cep CEP no formato 12345678 ou 12345-678
   * @returns Observable com os dados do endereço
   */
  getAddressByCep(cep: string): Observable<AddressData> {
    // Remove caracteres não numéricos do CEP
    const cleanCep = cep.replace(/\D/g, '');
    
    // Valida se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) {
      return throwError(() => new Error('CEP deve conter 8 dígitos'));
    }

    // Valida formato do CEP (não pode ser sequência de números iguais)
    if (/^(\d)\1{7}$/.test(cleanCep)) {
      return throwError(() => new Error('CEP inválido'));
    }

    const url = `${this.API_BASE_URL}/${cleanCep}/json/`;

    return this.http.get<ViaCepResponse>(url).pipe(
      map((response: ViaCepResponse) => {
        // Verifica se a API retornou erro
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }

        // Mapeia a resposta da API para nosso formato
        return {
          zipCode: response.cep,
          street: response.logradouro,
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
          complement: response.complemento
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Formata CEP para exibição (12345-678)
   * @param cep CEP sem formatação
   * @returns CEP formatado
   */
  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cep;
  }

  /**
   * Remove formatação do CEP
   * @param cep CEP formatado
   * @returns CEP apenas com números
   */
  cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Valida se o CEP está no formato correto
   * @param cep CEP para validar
   * @returns true se válido, false caso contrário
   */
  isValidCep(cep: string): boolean {
    const cleanCep = this.cleanCep(cep);
    return cleanCep.length === 8 && !/^(\d)\1{7}$/.test(cleanCep);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao consultar CEP';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        case 404:
          errorMessage = 'CEP não encontrado.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = `Erro: ${error.status} - ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}