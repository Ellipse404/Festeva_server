import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
}
