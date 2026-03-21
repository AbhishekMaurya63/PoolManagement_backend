import { IsEmail, IsEnum, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  TRAINER = 'trainer',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  locationId: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}