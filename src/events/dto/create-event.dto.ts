import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGES } from '../../constants';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.TITLE_REQUIRED })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.DATE_REQUIRED })
  date!: string; // YYYY-MM-DD or ISO string

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsNotEmpty({ message: MESSAGES.VALIDATION.LOCATION_NAME_REQUIRED })
  locationName!: string;

  @IsString()
  @IsOptional()
  locationAddress?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: MESSAGES.VALIDATION.TICKET_PRICE_INVALID })
  @Type(() => Number)
  ticketPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: MESSAGES.VALIDATION.TOTAL_CAPACITY_INVALID })
  @Type(() => Number)
  totalSeats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  availableSeats?: number;

  @IsString()
  @IsOptional()
  posterUrl?: string;

  @IsString()
  @IsOptional()
  hostName?: string;

  @IsString()
  @IsOptional()
  hostAvatar?: string;

  @IsString()
  @IsOptional()
  hostEmail?: string;
}
