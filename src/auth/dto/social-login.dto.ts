import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MESSAGES } from '../../constants';

export enum SocialProviderEnum {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export class SocialLoginDto {
  @IsEnum(SocialProviderEnum, {
    message: MESSAGES.VALIDATION.PROVIDER_MUST_BE_GOOGLE_OR_FACEBOOK,
  })
  provider: 'google' | 'facebook';

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_INVALID })
  email: string;

  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.NAME_REQUIRED })
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
