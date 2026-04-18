import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { TokenStorageService } from '../storage/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
     const tokenStorage = inject(TokenStorageService);
     const token = tokenStorage.getToken();

     if (!token) {
          return next(req);
     }

     return next(
          req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
     );
};
