import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  registrationId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMode: 'cash' | 'upi' | 'online';

  @IsBoolean()
  isFamilyPack: boolean;

  @IsNumber()
  validityDays: number;

  @IsString()
  screenshot?: string;
}