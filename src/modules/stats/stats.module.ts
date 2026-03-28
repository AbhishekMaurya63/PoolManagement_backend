import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../payments/schemas/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Payment, Attendance, User]), // ✅ IMPORTANT
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}