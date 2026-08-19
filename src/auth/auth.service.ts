/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { User } from '../users/entities/user.entity';
import { MESSAGES, IMAGES } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException(MESSAGES.AUTH.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      provider: 'email',
      avatar: IMAGES.AVATARS.DEFAULT_USER,
    });

    const accessToken = this.generateToken(user);
    delete user.password;

    return {
      accessToken,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = this.generateToken(user);
    delete user.password;

    return {
      accessToken,
      user,
    };
  }

  async socialLogin(dto: SocialLoginDto) {
    const avatar =
      dto.avatar ||
      (dto.provider === 'google'
        ? IMAGES.AVATARS.GOOGLE_FALLBACK
        : IMAGES.AVATARS.FACEBOOK_FALLBACK);

    const user = await this.usersService.findOrCreateSocialUser({
      email: dto.email,
      name: dto.name,
      avatar,
      provider: dto.provider,
      providerId: dto.providerId,
    });

    const accessToken = this.generateToken(user);
    delete user.password;

    return {
      accessToken,
      user,
    };
  }

  async googleLogin(idToken: string) {
    try {
      const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException(MESSAGES.AUTH.INVALID_GOOGLE_PAYLOAD);
      }

      const user = await this.usersService.findOrCreateSocialUser({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
        provider: 'google',
        providerId: payload.sub,
      });

      const accessToken = this.generateToken(user);
      delete user.password;

      return {
        accessToken,
        user,
      };
    } catch (err: any) {
      console.error(
        '❌ Google Token Verification Failed:',
        err?.message || err,
      );
      throw new UnauthorizedException(
        err?.message || MESSAGES.AUTH.GOOGLE_VERIFICATION_FAILED,
      );
    }
  }

  async facebookLogin(facebookAccessToken: string) {
    try {
      const fbAppId = this.configService.get<string>('FACEBOOK_APP_ID');
      const fbAppSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');

      // 1. Optional App Access Token security check if valid App ID & Secret are set
      if (
        fbAppId &&
        fbAppSecret &&
        !fbAppId.includes('your_facebook') &&
        !fbAppSecret.includes('your_facebook')
      ) {
        try {
          const appAccessToken = `${fbAppId}|${fbAppSecret}`;
          const debugRes = await fetch(
            `https://graph.facebook.com/debug_token?input_token=${facebookAccessToken}&access_token=${appAccessToken}`,
          );
          const debugData = await debugRes.json();

          if (debugData?.data?.app_id && debugData.data.app_id !== fbAppId) {
            throw new UnauthorizedException(
              MESSAGES.AUTH.FACEBOOK_APP_MISMATCH,
            );
          }
        } catch (e: any) {
          console.warn(
            '⚠️ Meta debug_token inspection skipped:',
            e?.message || e,
          );
        }
      }

      // 2. Direct Graph API user profile verification via Meta OAuth servers
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${facebookAccessToken}`,
      );
      const data = await response.json();
      if (data.error || !data.id) {
        console.error('❌ Meta Graph /me API error:', data.error);
        throw new BadRequestException(
          data.error?.message || MESSAGES.AUTH.INVALID_FACEBOOK_TOKEN,
        );
      }

      const email = data.email || `fb.${data.id}@facebook.com`;
      const avatar = data.picture?.data?.url;

      const user = await this.usersService.findOrCreateSocialUser({
        email,
        name: data.name || 'Facebook User',
        avatar,
        provider: 'facebook',
        providerId: data.id,
      });

      const accessToken = this.generateToken(user);
      delete user.password;

      return {
        accessToken,
        user,
      };
    } catch (err: any) {
      console.error(
        '❌ Facebook Token Verification Failed:',
        err?.message || err,
      );
      throw new UnauthorizedException(
        err?.message || MESSAGES.AUTH.FACEBOOK_VERIFICATION_FAILED,
      );
    }
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
