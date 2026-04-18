import {
     Component,
     computed,
     effect,
     inject,
     PLATFORM_ID,
     signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacade } from '../../application/auth.facade';
import { LoadingOverlayComponent } from '../../../../shared/ui/components/loading-overlay/loading-overlay.component';

export interface FarmSizeOption {
     value: string;
     label: string;
}

export const FARM_SIZE_OPTIONS: FarmSizeOption[] = [
     { value: 'small', label: 'Small-scale (< 2 acres)' },
     { value: 'mid', label: 'Mid-scale (2–10 acres)' },
     { value: 'large', label: 'Large-scale (> 10 acres)' },
     { value: 'other', label: 'Other' },
];

export const CROP_OPTIONS: string[] = [
     'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize',
     'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Potato',
     'Banana', 'Mango', 'Grape', 'Pomegranate', 'Other',
];

@Component({
     selector: 'app-profile-completion',
     imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          MatRadioModule,
          MatChipsModule,
          LoadingOverlayComponent,
     ],
     templateUrl: './profile-completion.component.html',
     styleUrl: './profile-completion.component.scss',
})
export class ProfileCompletionComponent {
     private readonly authFacade = inject(AuthFacade);
     private readonly router = inject(Router);
     private readonly fb = inject(FormBuilder);
     private readonly snackBar = inject(MatSnackBar);
     private readonly platformId = inject(PLATFORM_ID);

     readonly farmSizeOptions = FARM_SIZE_OPTIONS;
     readonly cropOptions = CROP_OPTIONS;

     readonly profileForm = this.fb.group({
          farmSizeType: [''],
          numberOfWorkers: ['', Validators.pattern(/^\d*$/)],
     });

     readonly selectedCrops = signal<string[]>([]);
     readonly profilePhotoFile = signal<File | null>(null);
     readonly profilePhotoPreviewUrl = signal<string | null>(null);
     readonly isLoading = this.authFacade.isLoading;

     private readonly formStatus = toSignal(this.profileForm.statusChanges, {
          initialValue: this.profileForm.status,
     });

     readonly isSaveEnabled = computed(() => !this.isLoading() && this.formStatus() !== 'INVALID');

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

     toggleCrop(crop: string): void {
          this.selectedCrops.update((crops) => {
               const exists = crops.includes(crop);
               return exists ? crops.filter((c) => c !== crop) : [...crops, crop];
          });
     }

     isCropSelected(crop: string): boolean {
          return this.selectedCrops().includes(crop);
     }

     onPhotoSelected(event: Event): void {
          const input = event.target as HTMLInputElement;
          const file = input.files?.[0];
          if (!file) return;

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

          if (!allowedTypes.includes(file.type)) {
               this.snackBar.open('Please upload a JPG, PNG, or WebP image', 'OK', {
                    duration: 4000,
               });
               return;
          }

          if (file.size > maxSizeBytes) {
               this.snackBar.open('Image must be under 5 MB', 'OK', { duration: 4000 });
               return;
          }

          this.profilePhotoFile.set(file);

          if (isPlatformBrowser(this.platformId)) {
               const reader = new FileReader();
               reader.onload = (e) => {
                    this.profilePhotoPreviewUrl.set(e.target?.result as string);
               };
               reader.readAsDataURL(file);
          }
     }

     triggerPhotoUpload(): void {
          if (isPlatformBrowser(this.platformId)) {
               document.getElementById('photo-input')?.click();
          }
     }

     async onSave(): Promise<void> {
          if (!this.profileForm.valid) {
               this.profileForm.markAllAsTouched();
               return;
          }
          const { farmSizeType, numberOfWorkers } = this.profileForm.getRawValue();
          const success = await this.authFacade.completeProfile({
               farmSizeType: farmSizeType ?? '',
               crops: this.selectedCrops(),
               numberOfWorkers: numberOfWorkers ?? '',
               profilePhotoFile: this.profilePhotoFile(),
          });

          if (success) {
               await this.router.navigate(['/dashboard']);
          }
     }

     async onSkip(): Promise<void> {
          await this.router.navigate(['/dashboard']);
     }
}
