import { IsDateString, IsEmail, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  photo: string;

  @IsString()
  aadhaarId: string;

  @IsString()
  locationId: string;

  @IsDateString()
  dob: string;
}