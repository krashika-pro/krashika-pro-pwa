import { Routes } from '@angular/router';

/**
 * Top-level routes.
 * All feature modules are lazy-loaded via loadChildren.
 * DI providers (ports → implementations) are wired inside each feature's routes file.
 *
 * Example:
 *   {
 *     path: 'auth',
 *     loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
 *   },
 */
export const routes: Routes = [
     {
          path: '',
          pathMatch: 'full',
          redirectTo: 'home',
     },
     {
          path: '**',
          redirectTo: 'home',
     },
];
