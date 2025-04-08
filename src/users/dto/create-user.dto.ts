import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jainam Mehta' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiProperty({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  pan_card?: string;

  @ApiProperty({ example: '123456789012' })
  @IsOptional()
  @IsString()
  aadhar_card?: string;

  @ApiProperty({ example: '29ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  gst_no?: string;

  @ApiProperty({ example: 'jainam@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  phone_number: string;

  @ApiProperty({ example: 'profile.jpg' })
  @IsOptional()
  @IsString()
  profile_pic?: string;

  @ApiProperty({ enum: ['super-admin', 'admin', 'staff', 'user'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'custom-group-id', required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ example: 'adminUserId', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otp_expiration: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otp_mode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  otp_attempts: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  role_id: number
}
