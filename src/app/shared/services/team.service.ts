import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';

export interface Team {
  id: number;
  name: string;
  short_name: string;
  abbreviation: string;
  shield: string;
}

export interface TeamsResponse {
  success: boolean;
  message: string;
  data: Team[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/v1';

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  getAllTeams(): Observable<TeamsResponse> {
    const token = this.localStorageService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<TeamsResponse>(`${this.API_BASE_URL}/football-teams`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erro na API de times:', error);
    return throwError(() => error);
  };
}