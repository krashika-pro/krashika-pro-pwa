export type UserRole = 'farmer' | 'agronomist' | 'input_dealer' | 'other';

export interface User {
  readonly id: string;
  readonly mobileNumber: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly location: string;
  readonly isProfileComplete: boolean;
  readonly profilePhotoUrl: string | null;
}
