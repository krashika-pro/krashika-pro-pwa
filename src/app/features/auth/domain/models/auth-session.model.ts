import type { User } from './user.model';

export interface OtpVerificationResult {
  readonly isNewUser: boolean;
  readonly user: User | null;
}

export interface RegistrationData {
  readonly mobileNumber: string;
  readonly fullName: string;
  readonly role: string;
  readonly location: string;
}

export interface ProfileCompletionData {
  readonly farmSizeType: string;
  readonly crops: string[];
  readonly numberOfWorkers: string;
  readonly profilePhotoFile: File | null;
}
