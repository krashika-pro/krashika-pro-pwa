import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthRepository } from '../../domain/ports/auth.repository';
import type { User } from '../../domain/models/user.model';
import type { OtpVerificationResult, RegistrationData, ProfileCompletionData } from '../../domain/models/auth-session.model';
import {
  ApiUserDto,
  ApiVerifyOtpResponseDto,
  mapApiUserToUser,
  mapApiVerifyOtpToResult,
} from '../mappers/auth.mapper';
import { TokenStorageService } from '../../../../shared/infrastructure/storage/token-storage.service';

@Injectable()
export class AuthApiRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  async sendOtp(mobileNumber: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>('/api/auth/send-otp', { mobileNumber }),
    );
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerificationResult> {
    const response = await firstValueFrom(
      this.http.post<ApiVerifyOtpResponseDto>('/api/auth/verify-otp', { mobileNumber, otp }),
    );
    this.tokenStorage.setToken(response.token);
    return mapApiVerifyOtpToResult(response);
  }

  async register(data: RegistrationData): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<ApiUserDto & { token: string }>('/api/auth/register', data),
    );
    this.tokenStorage.setToken(response.token);
    return mapApiUserToUser(response);
  }

  async completeProfile(data: ProfileCompletionData): Promise<User> {
    const formData = new FormData();
    formData.append('farmSizeType', data.farmSizeType);
    data.crops.forEach((crop) => formData.append('crops[]', crop));
    formData.append('numberOfWorkers', data.numberOfWorkers);
    if (data.profilePhotoFile) {
      formData.append('profilePhoto', data.profilePhotoFile);
    }
    const response = await firstValueFrom(
      this.http.post<ApiUserDto>('/api/auth/complete-profile', formData),
    );
    return mapApiUserToUser(response);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiUserDto>('/api/auth/me'),
      );
      return mapApiUserToUser(response);
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/logout', {}));
    } catch {
      // Swallow — logout clears local state regardless
    } finally {
      this.tokenStorage.clearToken();
    }
  }
}
