import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthHeaderDto } from './dto/auth-header.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phone_number);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and login' })
  @ApiResponse({ status: 200, description: 'OTP verified, token returned' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      verifyOtpDto.phone_number,
      verifyOtpDto.otp,
    );
  }

  @Get('validate')
  @ApiBearerAuth('access-token') // <-- match the name from Swagger config
  @ApiOperation({ summary: 'Validate JWT token' })
  async validate(@Req() req) {
    console.log("req.headers:: ", req.headers)
    // const token = headers.Authorization?.split(' ')[1];
    // if (!token) throw new UnauthorizedException('Token missing');
    return this.authService.validateJwtToken(req.headers.authorization?.split(' ')[1]);
  }
}
