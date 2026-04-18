import { Routes } from '@angular/router';
import { noAuthGuard } from '../../core/auth/auth.guard';

export const AUTH_ROUTES: Routes = [
     {
          path: '',
          children: [
               {
                    path: 'login',
                    canActivate: [noAuthGuard],
                    loadComponent: () =>
                         import('./ui/login/login.component').then((m) => m.LoginComponent),
               },
               {
                    path: 'otp-verification/:mobile',
                    loadComponent: () =>
                         import('./ui/otp-verification/otp-verification.component').then(
                              (m) => m.OtpVerificationComponent,
                         ),
               },
               {
                    path: 'registration',
                    loadComponent: () =>
                         import('./ui/registration/registration.component').then(
                              (m) => m.RegistrationComponent,
                         ),
               },
               {
                    path: 'profile-completion',
                    loadComponent: () =>
                         import('./ui/profile-completion/profile-completion.component').then(
                              (m) => m.ProfileCompletionComponent,
                         ),
               },
               {
                    path: '',
                    pathMatch: 'full',
                    redirectTo: 'login',
               },
          ],
     },
];
