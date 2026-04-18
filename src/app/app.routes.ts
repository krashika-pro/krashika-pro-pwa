import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
     {
          path: '',
          pathMatch: 'full',
          redirectTo: 'auth',
     },
     {
          path: 'auth',
          loadChildren: () =>
               import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
     },
     {
          path: 'dashboard',
          canActivate: [authGuard],
          loadComponent: () =>
               import('./features/dashboard/ui/dashboard.component').then(
                    (m) => m.DashboardComponent,
               ),
     },
     {
          path: '**',
          redirectTo: 'auth',
     },
];
