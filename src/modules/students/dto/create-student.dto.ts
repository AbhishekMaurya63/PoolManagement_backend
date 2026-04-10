import { IsDateString, IsEmail, IsString,IsBoolean } from 'class-validator';

export class CreateStudentDto {

  @IsString()
  userName?: string;

  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsString()
  phone?: string;

  @IsString()
  photo?: string;

  @IsString()
  aadhaarId?: string;

  @IsString()
  locationId?: string;

  @IsDateString()
  dob?: string;

  @IsBoolean()
  termsAccepted?:Boolean;
}