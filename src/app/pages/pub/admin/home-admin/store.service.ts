import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { AuthService } from '../../../../shared/services/auth.service';

// Interfaces para tipagem forte
export interface Store {
  id: number;
  name: string;
  logo_url: string | null;
}

export interface StoresResponse {
  success: boolean;
  data: {
    stores: Store[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getStores(): Observable<Store[]> {
    const headers = { 'Authorization': `Bearer ${this.authService.getAuthToken()}` };
    return this.http.get<StoresResponse>(`${this.API_BASE_URL}/stores`, { headers })
      .pipe(map(response => response.data.stores));
  }
}