import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../../shared/services/auth.service';

export interface StoreDetails {
  name: string;
  email: string;
  cnpj: string;
  logo_url: string;
  instagram_handle: string;
  facebook_handle: string;
  capacity: number;
  type?: string;
  legal_name?: string;
  phone?: string;
  zip_code?: string;
  address_street?: string;
  address_neighborhood?: string;
  address_state?: string;
  address_number?: string;
  address_complement?: string;
  banner_url: string;
  website: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getStoreById(storeId: string): Observable<StoreDetails> {
    const token = this.authService.getAuthToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ data: StoreDetails }>(`${this.API_BASE_URL}/stores/${storeId}`, { headers }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Erro ao buscar detalhes da loja:', error);
        return throwError(() => new Error('Não foi possível carregar os dados da loja.'));
      })
    );
  }
}