import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { EventService } from '../../pages/events/event.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AutoCheckinGuard implements CanActivate {
  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const idCode = route.paramMap.get('id_code') || '';
    if (!idCode) return of(true);

    // Garante que o usuário esteja autenticado antes de checar convidado
    return this.authService.isAuthenticated$.pipe(
      take(1),
      switchMap((isAuth) => {
        if (!isAuth) return of(true);
        return this.eventService.getEventByIdCodeDetail(idCode).pipe(
          switchMap(({ event }) => {
            const requiresAuto = this.toBool(event?.requires_auto_checkin);
            if (!requiresAuto) {
              return of(true);
            }
            return this.eventService.getEventGuestMe(idCode).pipe(
              map((guest) => {
                const isChecked = !!guest?.check_in_at;
                if (isChecked) return true;
                // Redireciona para tela de check-in antes do questionário
                const queryParams: Record<string, string> = { returnUrl: state.url };
                this.router.navigate([`/events/checkin/${idCode}`], { queryParams });
                return false;
              }),
              catchError(() => {
                const queryParams: Record<string, string> = { returnUrl: state.url };
                this.router.navigate([`/events/checkin/${idCode}`], { queryParams });
                return of(false);
              })
            );
          }),
          catchError(() => of(true))
        );
      })
    );
  }

  private toBool(v: any): boolean {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    return false;
  }
}