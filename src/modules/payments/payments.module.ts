import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './schemas/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StudentsModule } from '../students/students.module';
import { QR } from '../qr/entities/qr.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment,QR]),
    StudentsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}