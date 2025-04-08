export function generateOtp(length = 6): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  export function isOtpValid(
    savedOtp: string,
    expiry: Date,
    enteredOtp: string,
  ): boolean {
    return savedOtp === enteredOtp && new Date() <= new Date(expiry);
  }
  