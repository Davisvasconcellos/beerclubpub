import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AuthService } from './auth.service';

export interface VerifyUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:4000';

  constructor(private http: HttpClient, private authService: AuthService) { }

  verifyUserStatus = (idCode: string): Observable<VerifyUserResponse> => {
    const token = this.authService.getAuthToken();

    if (!token) {
      throw new Error('Token de autenticação não encontrado.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<VerifyUserResponse>(`${this.baseUrl}/api/v1/users/verify-status/${idCode}`, { headers });
  }
}