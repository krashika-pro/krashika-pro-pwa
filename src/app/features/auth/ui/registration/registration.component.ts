import {
     Component,
     computed,
     effect,
     inject,
     signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacade } from '../../application/auth.facade';
import { LoadingOverlayComponent } from '../../../../shared/ui/components/loading-overlay/loading-overlay.component';

export interface RoleOption {
     value: string;
     label: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
     { value: 'farmer', label: 'Farmer' },
     { value: 'agronomist', label: 'Agronomist / Advisor' },
     { value: 'input_dealer', label: 'Input Dealer' },
     { value: 'other', label: 'Other' },
];

@Component({
     selector: 'app-registration',
     imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          LoadingOverlayComponent,
     ],
     templateUrl: './registration.component.html',
     styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
     private readonly authFacade = inject(AuthFacade);
     private readonly router = inject(Router);
     private readonly fb = inject(FormBuilder);
     private readonly snackBar = inject(MatSnackBar);

     private readonly routerState = this.router.getCurrentNavigation()?.extras.state as
          | { mobileNumber?: string }
          | null
          | undefined;

     readonly mobileNumber = this.routerState?.mobileNumber ?? '';

     readonly registrationForm = this.fb.group({
          fullName: ['', [Validators.required, Validators.minLength(2)]],
          role: ['', Validators.required],
          location: ['', [Validators.required, Validators.minLength(2)]],
     });

     readonly roleOptions = ROLE_OPTIONS;
     readonly isLoading = this.authFacade.isLoading;

     private readonly formStatus = toSignal(this.registrationForm.statusChanges, {
          initialValue: this.registrationForm.status,
     });

     readonly isCreateEnabled = computed(
          () => !this.isLoading() && this.formStatus() === 'VALID',
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

     async onCreateAccount(): Promise<void> {
          if (!this.registrationForm.valid) {
               this.registrationForm.markAllAsTouched();
               return;
          }
          const { fullName, role, location } = this.registrationForm.getRawValue();
          const success = await this.authFacade.register(this.mobileNumber, {
               fullName: fullName!,
               role: role!,
               location: location!,
          });

          if (success) {
               await this.router.navigate(['/auth/profile-completion']);
          }
     }

     onBack(): void {
          this.router.navigate(['/auth/login']);
     }
}
