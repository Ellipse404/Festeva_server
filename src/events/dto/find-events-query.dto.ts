import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindEventsQueryDto {
  @IsNumber()
  @Type(() => Number)
  latitude!: number;

  @IsNumber()
  @Type(() => Number)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  radiusInMeters?: number = 10000; // Default to 10km if not provided
}