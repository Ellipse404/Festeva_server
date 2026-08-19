import { IsNotEmpty, IsString } from 'class-validator';
import { MESSAGES } from '../../constants';

export class FacebookLoginDto {
  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.FACEBOOK_TOKEN_REQUIRED })
  accessToken: string;
}
