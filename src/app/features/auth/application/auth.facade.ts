import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthRepository } from '../domain/ports/auth.repository';
import type { User } from '../domain/models/user.model';
import type { RegistrationData, ProfileCompletionData } from '../domain/models/auth-session.model';
import { isValidIndianMobileNumber } from '../domain/rules/validate-mobile';
import { isValidOtp } from '../domain/rules/validate-otp';

export interface OtpVerificationOutcome {
     readonly isNewUser: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
     private readonly authRepo = inject(AuthRepository);

     readonly user = signal<User | null>(null);
     readonly isLoading = signal(false);
     readonly error = signal<string | null>(null);
     readonly isAuthenticated = computed(() => this.user() !== null);

     async sendOtp(mobileNumber: string): Promise<boolean> {
          if (!isValidIndianMobileNumber(mobileNumber)) {
               this.error.set('Please enter a valid 10-digit mobile number');
               return false;
          }
          this.isLoading.set(true);
          this.error.set(null);
          try {
               await this.authRepo.sendOtp(mobileNumber);
               return true;
          } catch (e) {
               this.error.set(
                    e instanceof Error ? e.message : 'Failed to send OTP. Please try again.',
               );
               return false;
          } finally {
               this.isLoading.set(false);
          }
     }

     async verifyOtp(
          mobileNumber: string,
          otp: string,
     ): Promise<OtpVerificationOutcome | null> {
          if (!isValidOtp(otp)) {
               this.error.set('Please enter a valid 6-digit OTP');
               return null;
          }
          this.isLoading.set(true);
          this.error.set(null);
          try {
               const result = await this.authRepo.verifyOtp(mobileNumber, otp);
               if (result.user) {
                    this.user.set(result.user);
               }
               return { isNewUser: result.isNewUser };
          } catch (e) {
               this.error.set(
                    e instanceof Error ? e.message : 'Invalid OTP. Please try again.',
               );
               return null;
          } finally {
               this.isLoading.set(false);
          }
     }

     async register(
          mobileNumber: string,
          data: Omit<RegistrationData, 'mobileNumber'>,
     ): Promise<boolean> {
          this.isLoading.set(true);
          this.error.set(null);
          try {
               const user = await this.authRepo.register({ ...data, mobileNumber });
               this.user.set(user);
               return true;
          } catch (e) {
               this.error.set(
                    e instanceof Error ? e.message : 'Registration failed. Please try again.',
               );
               return false;
          } finally {
               this.isLoading.set(false);
          }
     }

     async completeProfile(data: ProfileCompletionData): Promise<boolean> {
          this.isLoading.set(true);
          this.error.set(null);
          try {
               const user = await this.authRepo.completeProfile(data);
               this.user.set(user);
               return true;
          } catch (e) {
               this.error.set(
                    e instanceof Error ? e.message : 'Failed to save profile. Please try again.',
               );
               return false;
          } finally {
               this.isLoading.set(false);
          }
     }

     async loadCurrentUser(): Promise<void> {
          try {
               const user = await this.authRepo.getCurrentUser();
               this.user.set(user);
          } catch {
               this.user.set(null);
          }
     }

     async logout(): Promise<void> {
          this.isLoading.set(true);
          try {
               await this.authRepo.logout();
          } finally {
               this.user.set(null);
               this.isLoading.set(false);
          }
     }
}
