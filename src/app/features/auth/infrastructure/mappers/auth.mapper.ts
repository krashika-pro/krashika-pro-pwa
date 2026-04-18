import type { User } from '../../domain/models/user.model';
import type { OtpVerificationResult } from '../../domain/models/auth-session.model';

export interface ApiUserDto {
  user_id: string;
  mobile: string;
  name: string;
  role: string;
  location: string;
  is_profile_complete: boolean;
  profile_photo_url: string | null;
}

export interface ApiVerifyOtpResponseDto {
  is_new_user: boolean;
  user: ApiUserDto | null;
  token: string;
}

export function mapApiUserToUser(dto: ApiUserDto): User {
  return {
    id: dto.user_id,
    mobileNumber: dto.mobile,
    fullName: dto.name,
    role: dto.role as User['role'],
    location: dto.location,
    isProfileComplete: dto.is_profile_complete,
    profilePhotoUrl: dto.profile_photo_url,
  };
}

export function mapApiVerifyOtpToResult(dto: ApiVerifyOtpResponseDto): OtpVerificationResult {
  return {
    isNewUser: dto.is_new_user,
    user: dto.user ? mapApiUserToUser(dto.user) : null,
  };
}
