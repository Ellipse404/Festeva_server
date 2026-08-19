import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGES } from '../../constants';

export class FindEventsQueryDto {
  @IsNumber()
  @Type(() => Number)
  latitude!: number;

  @IsNumber()
  @Type(() => Number)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: MESSAGES.EVENTS.INVALID_RADIUS })
  @Type(() => Number)
  radiusInMeters?: number = 10000; // Default to 10km if not provided
}
