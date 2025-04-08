export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }
  
  export function isOtpExpired(expiration: Date): boolean {
    return !expiration || new Date() > new Date(expiration);
  }
  