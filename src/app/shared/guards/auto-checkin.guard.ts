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

    // Força layout kiosk: se tentar acessar answer com flow=kiosk, redireciona para answer-plain
    const path = route.routeConfig?.path || '';
    const isAnswerRoute = path.includes('events/answer/:id_code') || state.url.startsWith('/events/answer/');
    const isAnswerPlainRoute = path.includes('events/answer-plain/:id_code') || state.url.startsWith('/events/answer-plain/');
    const flow = route.queryParamMap.get('flow');
    if (isAnswerRoute && flow === 'kiosk') {
      try { console.log('[AutoCheckinGuard] Forçando kiosk: redirecionando answer → answer-plain', { idCode, flow }); } catch {}
      this.router.navigate([`/events/answer-plain/${idCode}`], { queryParams: route.queryParams });
      return of(false);
    }

    // Garante que o usuário esteja autenticado antes de checar convidado
    return this.authService.isAuthenticated$.pipe(
      take(1),
      switchMap((isAuth) => {
        if (!isAuth) return of(true);
        return this.eventService.getEventByIdCodeDetail(idCode).pipe(
          switchMap(({ event }) => {
            const requiresAuto = this.toBool(event?.requires_auto_checkin);
            const autoQuest = this.toBool((event as any)?.auto_checkin_flow_quest);

            // Se está indo para answer (com layout) e auto_checkin_flow_quest ativo, força kiosk (sem layout)
            if (isAnswerRoute && autoQuest && !isAnswerPlainRoute) {
              try { console.log('[AutoCheckinGuard] auto_checkin_flow_quest=true. Redirecionando answer → answer-plain'); } catch {}
              this.router.navigate([`/events/answer-plain/${idCode}`], { queryParams: route.queryParams });
              return of(false);
            }
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