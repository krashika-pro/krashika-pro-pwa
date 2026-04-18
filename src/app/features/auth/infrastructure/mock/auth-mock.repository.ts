import { Injectable } from '@angular/core';
import { AuthRepository } from '../../domain/ports/auth.repository';
import type { User } from '../../domain/models/user.model';
import type {
     OtpVerificationResult,
     RegistrationData,
     ProfileCompletionData,
} from '../../domain/models/auth-session.model';

/**
 * Mock AuthRepository used during development while the backend is not yet
 * available.  Simulates the full OTP → registration → profile-completion flow
 * entirely in memory.
 *
 * Rules:
 *  - Any valid 10-digit number is accepted for sendOtp.
 *  - OTP "123456" always succeeds.
 *  - Numbers already in `registeredNumbers` resolve as existing users.
 *  - All other verified numbers are treated as new users → Registration flow.
 */
@Injectable()
export class AuthMockRepository extends AuthRepository {
     private readonly registeredNumbers = new Set<string>(['9999999999']);
     private currentUser: User | null = null;

     private delay(ms = 800): Promise<void> {
          return new Promise((resolve) => setTimeout(resolve, ms));
     }

     async sendOtp(mobileNumber: string): Promise<void> {
          await this.delay();
          // Simulate success — OTP "delivered" to the number
          console.debug(`[MockAuth] OTP sent to ${mobileNumber}. Use 123456 to verify.`);
     }

     async verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerificationResult> {
          await this.delay();
          if (otp !== '123456') {
               throw new Error('Invalid OTP. Use 123456 for testing.');
          }

          const isExistingUser = this.registeredNumbers.has(mobileNumber);
          if (isExistingUser) {
               const user: User = {
                    id: 'mock-existing-user',
                    mobileNumber,
                    fullName: 'Test Farmer',
                    role: 'farmer',
                    location: 'Pune, Maharashtra',
                    isProfileComplete: true,
                    profilePhotoUrl: null,
               };
               this.currentUser = user;
               return { isNewUser: false, user };
          }

          return { isNewUser: true, user: null };
     }

     async register(data: RegistrationData): Promise<User> {
          await this.delay();
          const user: User = {
               id: `mock-${Date.now()}`,
               mobileNumber: data.mobileNumber,
               fullName: data.fullName,
               role: data.role as User['role'],
               location: data.location,
               isProfileComplete: false,
               profilePhotoUrl: null,
          };
          this.registeredNumbers.add(data.mobileNumber);
          this.currentUser = user;
          return user;
     }

     async completeProfile(data: ProfileCompletionData): Promise<User> {
          await this.delay();
          if (!this.currentUser) {
               throw new Error('No authenticated user found.');
          }
          const updated: User = {
               ...this.currentUser,
               isProfileComplete: true,
          };
          this.currentUser = updated;
          return updated;
     }

     async getCurrentUser(): Promise<User | null> {
          return this.currentUser;
     }

     async logout(): Promise<void> {
          this.currentUser = null;
     }
}
