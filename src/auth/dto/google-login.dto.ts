import { IsNotEmpty, IsString } from 'class-validator';
import { MESSAGES } from '../../constants';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.GOOGLE_TOKEN_REQUIRED })
  idToken: string;
}
