import {
     Component,
     computed,
     DestroyRef,
     effect,
     inject,
     OnInit,
     PLATFORM_ID,
     signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacade } from '../../application/auth.facade';
import { LoadingOverlayComponent } from '../../../../shared/ui/components/loading-overlay/loading-overlay.component';

const OTP_RESEND_SECONDS = 30;

@Component({
     selector: 'app-otp-verification',
     imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          LoadingOverlayComponent,
     ],
     templateUrl: './otp-verification.component.html',
     styleUrl: './otp-verification.component.scss',
})
export class OtpVerificationComponent implements OnInit {
     private readonly authFacade = inject(AuthFacade);
     private readonly router = inject(Router);
     private readonly route = inject(ActivatedRoute);
     private readonly snackBar = inject(MatSnackBar);
     private readonly destroyRef = inject(DestroyRef);
     private readonly platformId = inject(PLATFORM_ID);

     readonly mobileNumber = this.route.snapshot.paramMap.get('mobile') ?? '';

     readonly otpControl = new FormControl('', [
          Validators.required,
          Validators.pattern(/^\d{6}$/),
     ]);

     readonly isLoading = this.authFacade.isLoading;
     readonly otpError = signal<string | null>(null);
     readonly isResendEnabled = signal(false);
     readonly resendCountdown = signal(OTP_RESEND_SECONDS);

     private readonly otpStatus = toSignal(this.otpControl.statusChanges, {
          initialValue: this.otpControl.status,
     });

     readonly isVerifyEnabled = computed(
          () => !this.isLoading() && this.otpStatus() === 'VALID',
     );

     readonly isResendButtonEnabled = computed(
          () => !this.isLoading() && this.isResendEnabled(),
     );

     private countdownTimer: ReturnType<typeof setInterval> | null = null;

     constructor() {
          effect(() => {
               const error = this.authFacade.error();
               if (error) {
                    this.otpError.set(error);
               }
          });

          this.destroyRef.onDestroy(() => this.clearCountdown());
     }

     ngOnInit(): void {
          if (isPlatformBrowser(this.platformId)) {
               this.startResendCountdown();
          }
     }

     private startResendCountdown(): void {
          this.clearCountdown();
          this.resendCountdown.set(OTP_RESEND_SECONDS);
          this.isResendEnabled.set(false);

          this.countdownTimer = setInterval(() => {
               const current = this.resendCountdown();
               if (current <= 1) {
                    this.clearCountdown();
                    this.resendCountdown.set(0);
                    this.isResendEnabled.set(true);
               } else {
                    this.resendCountdown.update((n) => n - 1);
               }
          }, 1000);
     }

     private clearCountdown(): void {
          if (this.countdownTimer !== null) {
               clearInterval(this.countdownTimer);
               this.countdownTimer = null;
          }
     }

     async onVerify(): Promise<void> {
          if (!this.otpControl.valid) {
               this.otpControl.markAsTouched();
               return;
          }
          this.otpError.set(null);
          const otp = this.otpControl.value!.trim();
          const outcome = await this.authFacade.verifyOtp(this.mobileNumber, otp);

          if (outcome === null) {
               return; // error is set in facade and shown via effect
          }

          if (outcome.isNewUser) {
               await this.router.navigate(['/auth/registration'], {
                    state: { mobileNumber: this.mobileNumber },
               });
          } else {
               await this.router.navigate(['/dashboard']);
          }
     }

     async onResendOtp(): Promise<void> {
          if (!this.isResendEnabled()) return;
          this.otpError.set(null);
          const success = await this.authFacade.sendOtp(this.mobileNumber);
          if (success) {
               this.otpControl.reset();
               this.snackBar.open('OTP resent successfully', 'OK', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
               });
               if (isPlatformBrowser(this.platformId)) {
                    this.startResendCountdown();
               }
          }
     }

     onBack(): void {
          this.router.navigate(['/auth/login']);
     }
}
