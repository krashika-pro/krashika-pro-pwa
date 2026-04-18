import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../../features/auth/application/auth.facade';

/** Blocks access to protected routes when the user is not authenticated. */
export const authGuard: CanActivateFn = () => {
     const authFacade = inject(AuthFacade);
     const router = inject(Router);

     if (authFacade.isAuthenticated()) {
          return true;
     }
     return router.createUrlTree(['/auth/login']);
};

/** Blocks access to auth routes when the user is already authenticated. */
export const noAuthGuard: CanActivateFn = () => {
     const authFacade = inject(AuthFacade);
     const router = inject(Router);

     if (!authFacade.isAuthenticated()) {
          return true;
     }
     return router.createUrlTree(['/dashboard']);
};
