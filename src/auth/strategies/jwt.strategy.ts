import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'festeva_secret_key_jwt_2026_super_secure_static_key',
    });
  }

  async validate(payload: JwtPayload) {
    let user = payload.sub
      ? await this.usersService.findById(payload.sub)
      : null;
    if (!user && payload.email) {
      user = await this.usersService.findByEmail(payload.email);
    }
    if (!user) {
      user = await this.usersService.create({
        email: payload.email || `user.${Date.now()}@festeva.com`,
        name: 'Festeva User',
        provider: 'email',
      });
    }
    return user;
  }
}
