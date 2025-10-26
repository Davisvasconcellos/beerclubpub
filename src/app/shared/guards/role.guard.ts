import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/signin']);
          return false;
        }

        const hasRequiredRole = requiredRoles.includes(user.role);
        
        if (!hasRequiredRole) {
          // Redireciona para página apropriada baseada no role do usuário
          this.redirectToUserHome(user.role);
          return false;
        }

        return true;
      })
    );
  }

  private redirectToUserHome(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'admin': '/home-admin',
      'master': '/home-master',
      'manager': '/home-manager',
      'waiter': '/home-waiter',
      'customer': '/home-customer'
    };

    const redirectRoute = roleRoutes[role] || '/dashboard';
    this.router.navigate([redirectRoute]);
  }
}