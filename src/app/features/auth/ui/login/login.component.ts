import { Component, computed, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacade } from '../../application/auth.facade';
import { LoadingOverlayComponent } from '../../../../shared/ui/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingOverlayComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly mobileControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[6-9]\d{9}$/),
  ]);

  readonly isLoading = this.authFacade.isLoading;

  private readonly mobileStatus = toSignal(this.mobileControl.statusChanges, {
    initialValue: this.mobileControl.status,
  });

  readonly isSendOtpEnabled = computed(
    () => !this.isLoading() && this.mobileStatus() === 'VALID',
  );

  constructor() {
    effect(() => {
      const error = this.authFacade.error();
      if (error) {
        this.snackBar.open(error, 'Dismiss', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      }
    });
  }

  async onSendOtp(): Promise<void> {
    console.log("hi there onSendOtp called with mobile:", this.mobileControl.value);
    debugger
    if (!this.mobileControl.valid) {
      this.mobileControl.markAsTouched();
      return;
    }
    const mobile = this.mobileControl.value!.trim();
    const success = await this.authFacade.sendOtp(mobile);
    if (success) {
      await this.router.navigate(['/auth/otp-verification', mobile]);
    }
  }
}
