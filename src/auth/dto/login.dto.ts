import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { MESSAGES } from '../../constants';

export class LoginDto {
  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_INVALID })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
