import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  date!: string; // YYYY-MM-DD or ISO string

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsNotEmpty()
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
  @Min(0)
  @Type(() => Number)
  ticketPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
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
