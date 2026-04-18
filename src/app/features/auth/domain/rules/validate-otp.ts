/** Returns true if the OTP is a valid 6-digit numeric string. */
export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp.trim());
}
