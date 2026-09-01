import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  if (currentUser) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const loginGuard = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  if (currentUser) {
    if (currentUser.role === 'admin') {
      router.navigate(['/admin']);
    } else if (currentUser.role === 'entrepreneur') {
      router.navigate(['/entrepreneur']);
    } else {
      router.navigate(['/vc/discover']);
    }
    return false;
  }

  return true;
};
