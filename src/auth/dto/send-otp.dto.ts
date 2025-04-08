import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IN') // or use 'ZZ' for any region
  phone_number: string;
}
