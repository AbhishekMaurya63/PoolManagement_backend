import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from '../payments/payments.module';
import { QRController } from './qr.controller';
import { QRService } from './qr.service';
import { QR } from './entities/qr.entity';
import { Payment } from '../payments/schemas/payment.entity';
import { Student } from '../students/entities/student.entity';
import { ImagesModule } from '../upload/image.module';
@Module({
  imports: [TypeOrmModule.forFeature([QR, Payment, Student]),ImagesModule],
  providers: [QRService],
  controllers: [QRController],
  exports: [QRService],
})
export class QRModule {}