import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'Cashfree Order ID is required' })
  cfOrderId: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
