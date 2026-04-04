import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  registrationId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMode: 'cash' | 'upi' | 'online';

  @IsNumber()
  validityDays: number;

  @IsString()
  screenshot?: string;
}