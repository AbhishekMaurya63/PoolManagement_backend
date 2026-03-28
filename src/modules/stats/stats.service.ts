import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../payments/schemas/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) {}

 async getStaffStats(query: any, user: any) {
  const { filter = query.dateFilter, fromDate, toDate } = query;

  const { start, end } = this.getDateRange(filter, fromDate, toDate);

  // =========================
  // ✅ TOTAL REGISTRATIONS
  // =========================
  const totalRegistrations = await this.studentRepo.count({
    where: {
      locationId: user.locationId,
      createdAt: Between(start, end),
    },
  });

  // =========================
  // ✅ TOTAL PAYMENTS
  // =========================
  const totalPayments = await this.paymentRepo.count({
    where: {
      locationId: user.locationId,
      createdAt: Between(start, end),
    },
  });

  // =========================
  // 💰 TOTAL REVENUE
  // =========================
  const revenueResult = await this.paymentRepo
    .createQueryBuilder('payment')
    .select('SUM(payment.amount)', 'total')
    .where('payment.createdAt BETWEEN :start AND :end', { start, end })
    .andWhere('payment.locationId = :locationId', {
      locationId: user.locationId,
    })
    .getRawOne();

  const totalRevenue = Number(revenueResult?.total) || 0;

  return {
    filter,
    range: {
      start,
      end,
    },
    data: {
      totalRegistrations,
      totalPayments,
      totalRevenue,
    },
  };
}

  // 🔥 Date Range Helper
private getDateRange(filter: string, fromDate: string, toDate: string) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const toUTC = (date: Date) => {
    return new Date(date.getTime() - IST_OFFSET);
  };

  const now = new Date();

  let startIST: Date;
  let endIST: Date;

  switch (filter) {
    case 'today':
      startIST = new Date();
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date();
      endIST.setHours(23, 59, 59, 999);
      break;

    case 'week':
      startIST = new Date();
      startIST.setDate(startIST.getDate() - startIST.getDay()); // Sunday start
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date();
      endIST.setHours(23, 59, 59, 999);
      break;

    case 'month':
      startIST = new Date(now.getFullYear(), now.getMonth(), 1);
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endIST.setHours(23, 59, 59, 999);
      break;

    case 'year':
      startIST = new Date(now.getFullYear(), 0, 1);
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date(now.getFullYear(), 11, 31);
      endIST.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      startIST = new Date(fromDate);
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date(toDate);
      endIST.setHours(23, 59, 59, 999);
      break;

    default:
      startIST = new Date();
      startIST.setHours(0, 0, 0, 0);

      endIST = new Date();
      endIST.setHours(23, 59, 59, 999);
  }

  // 🔥 Convert IST → UTC BEFORE returning
  const start = toUTC(startIST);
  const end = toUTC(endIST);

  return { start, end };
}


async getTrainerStats(query: any, user: any) {
  const { filter = 'today', fromDate, toDate } = query;

  const { start, end } = this.getDateRange(filter, fromDate, toDate);

  // ✅ STEP 1: Get ACTIVE students (IMPORTANT)
  const totalStudents = await this.studentRepo.count({
    where: {
      isActive: true,
      locationId: user.locationId, // 👈 important (trainer's location)
    },
  });

  // ✅ STEP 2: Get PRESENT students (unique per day)
  const presentResult = await this.attendanceRepo
    .createQueryBuilder('attendance')
    .select('COUNT(DISTINCT attendance.studentId)', 'count')
    .where('attendance.createdAt BETWEEN :start AND :end', { start, end })
    .andWhere('attendance.locationId = :locationId', {
      locationId: user.locationId,
    })
    .getRawOne();

  const totalPresent = Number(presentResult.count) || 0;

  // ✅ STEP 3: Calculate ABSENT
  const totalAbsent = totalStudents - totalPresent;

  return {
    filter,
    range: { start, end },
    data: {
      totalStudents,
      totalPresent,
      totalAbsent,
    },
  };
}

async getAdminStats(query: any) {
  const { filter = query.dateFilter, fromDate, toDate,locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);
    const totalRegistrations = await this.studentRepo.count({
    where: {
      locationId: locationId,
      createdAt: Between(start, end),
    },
  });
  const totalPayments = await this.paymentRepo.count({
    where: {
      locationId: locationId,
      createdAt: Between(start, end),
    },
  });
  const totalRevenue = await this.paymentRepo
    .createQueryBuilder('payment')
    .select('SUM(payment.amount)', 'total')
    .where('payment.createdAt BETWEEN :start AND :end', { start, end })
    .andWhere('payment.locationId = :locationId', {
      locationId: locationId,
    })
    .getRawOne();

  const totalRevenueAmount = Number(totalRevenue?.total) || 0;

  const totalStudents = await this.studentRepo.count({
    where: {
      isActive: true,
      locationId: locationId,
      createdAt: Between(start, end),
    },
  });

   const presentResult = await this.attendanceRepo
    .createQueryBuilder('attendance')
    .select('COUNT(DISTINCT attendance.studentId)', 'count')
    .where('attendance.createdAt BETWEEN :start AND :end', { start, end })
    .andWhere('attendance.locationId = :locationId', {
      locationId:locationId,
    })
    .getRawOne();

  const totalPresent = Number(presentResult.count) || 0;

  // ✅ STEP 3: Calculate ABSENT
  const totalAbsent = totalStudents - totalPresent;

  return {
    filter,
    range: {
      start,
      end,
    },
    data: {
      totalRegistrations,
      totalPayments,
      totalRevenue: totalRevenueAmount,
      totalStudents,
      totalPresent,
      totalAbsent,
    },
  };
}
}