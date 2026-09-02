import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import * as jwt from 'jsonwebtoken';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.verificationService.sendPhoneOtp(dto.phoneNumber);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Request() req: any, @Body() dto: VerifyOtpDto) {
    let targetUserId = dto.userId;
    let targetUserEmail = dto.userEmail;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
        if (decoded?.email) targetUserEmail = decoded.email;
      } catch (e) {
        // ignore
      }
    }

    return this.verificationService.verifyPhoneOtp(
      dto.phoneNumber,
      dto.otp,
      targetUserId,
      targetUserEmail,
    );
  }

  @Post('send-email-otp')
  @HttpCode(HttpStatus.OK)
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return this.verificationService.sendEmailOtp(dto.email);
  }

  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Request() req: any, @Body() dto: VerifyEmailOtpDto) {
    let targetUserId = dto.userId;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
      } catch (e) {
        // ignore
      }
    }

    return this.verificationService.verifyEmailOtp(
      dto.email,
      dto.otp,
      targetUserId,
    );
  }

  @Post('verify-identity')
  @HttpCode(HttpStatus.OK)
  async verifyIdentity(@Request() req: any, @Body() dto: VerifyIdentityDto) {
    let targetUserId = dto.userId;
    let targetUserEmail = dto.userEmail;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
        if (decoded?.email) targetUserEmail = decoded.email;
      } catch (e) {
        // Silently ignore token decode error
      }
    }

    return this.verificationService.processVerification(
      targetUserId,
      dto.aadhaarImage,
      dto.selfieImage,
      targetUserEmail,
    );
  }
}
