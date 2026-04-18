/** Returns true if the mobile number is a valid Indian 10-digit number. */
export function isValidIndianMobileNumber(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}
