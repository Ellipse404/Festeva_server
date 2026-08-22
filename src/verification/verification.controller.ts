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
import * as jwt from 'jsonwebtoken';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify-identity')
  @HttpCode(HttpStatus.OK)
  async verifyIdentity(@Request() req: any, @Body() dto: VerifyIdentityDto) {
    let targetUserId = dto.userId;
    let targetUserEmail = dto.userEmail;

    // Optional manual JWT extraction from Authorization header without Passport 401 throw
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
        if (decoded?.email) targetUserEmail = decoded.email;
      } catch (e) {
        // Silently ignore token decode error and rely on payload email/id
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
