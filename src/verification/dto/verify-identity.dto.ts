import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyIdentityDto {
  @IsString()
  @IsNotEmpty({ message: 'Aadhaar card image (base64) is required' })
  aadhaarImage: string;

  @IsString()
  @IsNotEmpty({ message: 'Live selfie image (base64) is required' })
  selfieImage: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
