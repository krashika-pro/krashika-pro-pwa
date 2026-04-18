import type { User } from '../models/user.model';
import type { OtpVerificationResult, RegistrationData, ProfileCompletionData } from '../models/auth-session.model';

export abstract class AuthRepository {
  abstract sendOtp(mobileNumber: string): Promise<void>;
  abstract verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerificationResult>;
  abstract register(data: RegistrationData): Promise<User>;
  abstract completeProfile(data: ProfileCompletionData): Promise<User>;
  abstract getCurrentUser(): Promise<User | null>;
  abstract logout(): Promise<void>;
}
