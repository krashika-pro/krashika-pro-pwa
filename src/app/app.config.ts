import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { AuthRepository } from './features/auth/domain/ports/auth.repository';
import { AuthApiRepository } from './features/auth/infrastructure/api/auth-api.repository';
import { AuthMockRepository } from './features/auth/infrastructure/mock/auth-mock.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // Auth DI — use mock while the backend is not yet available.
    // Switch to AuthApiRepository once the backend is ready.
    {
      provide: AuthRepository,
      useClass: isDevMode() ? AuthMockRepository : AuthApiRepository,
    },
  ],
};
