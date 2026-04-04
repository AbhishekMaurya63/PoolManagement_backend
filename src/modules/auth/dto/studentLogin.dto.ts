import { IsEmail, IsString } from 'class-validator';

export class StudentLoginDto {
  @IsString()
  userName: string;

  @IsString()
  password: string;
}