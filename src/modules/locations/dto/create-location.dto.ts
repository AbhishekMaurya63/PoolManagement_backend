import { IsNumber, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  timing: string;

  @IsNumber()
  capacity: number;
}
import { PartialType } from '@nestjs/swagger';
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}