import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { generateOtp, isOtpExpired } from 'src/common/utils/otp';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async sendOtp(phone_number: string): Promise<string> {
    const user = await this.usersService.findByPhone(phone_number);
    if (!user) throw new BadRequestException('User not found');

    const otp = generateOtp();
    const otp_expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    user.otp = otp;
    user.otp_expiration = otp_expiration;
    user.otp_attempts = 0;

    await (user as any).save();

    console.log(`OTP for ${phone_number}: ${otp}`); // Simulate send

    return 'OTP sent successfully';
  }

  async verifyOtp(phone_number: string, otp: string): Promise<{ token: string }> {
    const user = await this.usersService.findByPhone(phone_number);
    if (!user) throw new UnauthorizedException('Invalid phone number');

    if (user.otp_attempts >= 5) throw new UnauthorizedException('Too many attempts');
    if (isOtpExpired(user.otp_expiration)) throw new UnauthorizedException('OTP expired');
    if (user.otp !== otp) {
      user.otp_attempts += 1;
      await (user as any).save();
      throw new UnauthorizedException('Invalid OTP');
    }

    // Reset OTP fields
    user.otp = undefined;
    user.otp_expiration = undefined;
    user.otp_attempts = 0;
    await (user as any).save();

    const payload = { uid: user.uid, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async validateJwtToken(token: string) {
    try {
      console.log("token :: " ,token)
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
