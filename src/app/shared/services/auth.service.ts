import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, timeout } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';

// Interfaces para tipagem
export interface User {
  id: number;
  id_code: string;
  name: string;
  email: string;
  phone?: string;
  role: 'waiter' | 'customer' | 'master' | 'admin' | 'manager';
  google_id?: string | null;
  avatar_url?: string | null;
  birth_date?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  email_verified: boolean;
  status: string;
  team_user?: number;
  plan_id?: number;
  plan_start?: string | null;
  plan_end?: string | null;
  created_at?: string;
  avatar?: string;
  handleUrl?: string;
  plan?: {
    id: number;
    name: 'Bronze' | 'Silver' | 'Gold';
    price: string;
    description: string;
  };
  team?: {
    name: string;
    short_name: string;
    abbreviation: string;
    shield: string;
  };
}

export interface UserMeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expiresIn?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/v1';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.localStorageService.getAuthToken();
    const user = this.localStorageService.getCurrentUser<User>();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.data) {
            this.localStorageService.setAuthToken(response.data.token);
            this.localStorageService.setCurrentUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.data) {
            this.localStorageService.setAuthToken(response.data.token);
            this.localStorageService.setCurrentUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    const token = this.getAuthToken();
    const headers: { [key: string]: string } = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post(`${this.API_BASE_URL}/auth/signout`, {}, { headers })
      .pipe(
        timeout(5000), // Timeout de 5 segundos
        catchError(() => of(null)), // Continue mesmo se a API falhar
        tap(() => {
          this.localStorageService.clearAuthData();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        })
      );
  }

  // Métodos auxiliares
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Buscar dados atualizados do usuário logado
  getUserMe(): Observable<UserMeResponse> {
    const token = this.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Token não encontrado'));
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.get<UserMeResponse>(`${this.API_BASE_URL}/auth/me`, { headers })
      .pipe(
        tap((response: UserMeResponse) => {
          if (response.success && response.data) {
            // Mapear os dados da API para o formato esperado pelos componentes
            const mappedUser = this.mapApiUserToUser(response.data.user);
            
            // Atualizar o usuário atual no localStorage e no BehaviorSubject
            this.localStorageService.setCurrentUser(mappedUser);
            this.currentUserSubject.next(mappedUser);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Mapear dados da API para o formato esperado pelos componentes
  private mapApiUserToUser(apiUser: any): User {
    return {
      ...apiUser,
      avatar: apiUser.avatar_url || undefined,
      handleUrl: `wall.et/${apiUser.name?.toLowerCase().replace(/\s+/g, '') || 'usuario'}`
    };
  }

  getAuthToken(): string | null {
    return this.localStorageService.getAuthToken();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  };
}