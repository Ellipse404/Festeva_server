import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MESSAGES } from '../../constants';

export class RegisterDto {
  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_INVALID })
  email: string;

  @IsString()
  @MinLength(8, { message: MESSAGES.VALIDATION.PASSWORD_TOO_SHORT })
  password: string;

  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.NAME_REQUIRED })
  @MinLength(2, { message: MESSAGES.VALIDATION.NAME_REQUIRED })
  name: string;
}
