import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IN') // or 'ZZ' for generic
  phone_number: string;

  @IsNotEmpty()
  @Length(4, 6) // assuming OTP length
  otp: string;
}
