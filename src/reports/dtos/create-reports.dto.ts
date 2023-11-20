import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsLongitude,
  IsLatitude,
  IsBoolean,
} from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1930)
  @Max(new Date().getFullYear())
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  milage: number;

  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;
}
