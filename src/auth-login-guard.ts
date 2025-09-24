import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authLoginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.navigateByUrl('/login');
    return false;
  }

  return true;
};
