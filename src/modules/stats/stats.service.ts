import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../payments/schemas/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User, UserRole } from '../users/entity/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  async getStaffStats(query: any, user: any) {
    if (user.role === 'admin') {
      const { filter = query.dateFilter, fromDate, toDate, locationId } = query;

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

      const revenueResult = await this.paymentRepo
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.createdAt BETWEEN :start AND :end', { start, end })
        .andWhere('payment.locationId = :locationId', {
          locationId: locationId,
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

    const { filter = query.dateFilter, fromDate, toDate } = query;

    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    const totalRegistrations = await this.studentRepo.count({
      where: {
        locationId: user.locationId,
        createdAt: Between(start, end),
      },
    });
    const totalPayments = await this.paymentRepo.count({
      where: {
        locationId: user.locationId,
        createdAt: Between(start, end),
      },
    });

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
    if (user.role === 'admin') {
      const { filter = 'today', fromDate, toDate, locationId } = query;
      const { start, end } = this.getDateRange(filter, fromDate, toDate);

      const totalStudents = await this.studentRepo.count({
        where: {
          isActive: true,
          locationId: locationId,
        },
      });


      const presentResult = await this.attendanceRepo
        .createQueryBuilder('attendance')
        .select('COUNT(DISTINCT attendance.studentId)', 'count')
        .where('attendance.createdAt BETWEEN :start AND :end', { start, end })
        .andWhere('attendance.locationId = :locationId', {
          locationId: locationId,
        })
        .getRawOne();

      const totalPresent = Number(presentResult.count) || 0;
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
    const { filter = 'today', fromDate, toDate } = query;

    const { start, end } = this.getDateRange(filter, fromDate, toDate);
    const totalStudents = await this.studentRepo.count({
      where: {
        isActive: true,
        locationId: user.locationId,
      },
    });
    const presentResult = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .select('COUNT(DISTINCT attendance.studentId)', 'count')
      .where('attendance.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('attendance.locationId = :locationId', {
        locationId: user.locationId,
      })
      .getRawOne();

    const totalPresent = Number(presentResult.count) || 0;
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

  // ============================================
  // 💳 PAYMENT REPORT API
  // ============================================
  async getPaymentReport(query: any, user: any) {
    const { filter = 'today', fromDate, toDate,locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    // Get all payments with student details
    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect(
        Student,
        'student',
        'student.registrationId = payment.registrationId',
      )
      .where('payment.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('payment.locationId = :locationId', {
        locationId: locationId,
      })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    // Calculate summary
    const totalPayments = payments.length;
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Group by payment mode
    const paymentsByModeMap: any = {};
    payments.forEach((payment) => {
      const mode = payment.paymentMode || 'unknown';
      if (!paymentsByModeMap[mode]) {
        paymentsByModeMap[mode] = { count: 0, amount: 0 };
      }
      paymentsByModeMap[mode].count++;
      paymentsByModeMap[mode].amount += Number(payment.amount);
    });

    const paymentsByMode = Object.entries(paymentsByModeMap).map(
      ([mode, data]: any) => ({
        mode,
        count: data.count,
        amount: data.amount,
      }),
    );

    // Count active and expired members
    const now = new Date();
    const activeMembers = payments.filter(
      (p) => p.isActive && new Date(p.validTill) > now,
    ).length;
    const expiredMembers = payments.filter(
      (p) => !p.isActive || new Date(p.validTill) <= now,
    ).length;

    // Format details
    const details = payments.map((payment) => ({
      id: payment.id,
      studentName: payment.student?.name || 'N/A',
      registrationId: payment.registrationId,
      amount: Number(payment.amount),
      paymentMode: payment.paymentMode,
      validFrom: payment.validFrom,
      validTill: payment.validTill,
      isActive: payment.isActive,
      createdAt: payment.createdAt,
    }));

    return {
      filter,
      range: { start, end },
      summary: {
        totalPayments,
        totalRevenue,
        averagePayment: parseFloat(averagePayment.toFixed(2)),
        paymentsByMode,
        activeMembers,
        expiredMembers,
      },
      details,
    };
  }

  // ============================================
  // 👥 STUDENT REPORT API
  // ============================================
  async getStudentReport(query: any, user: any) {
    const { filter = 'today', fromDate, toDate, locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    // Get all students with filters
    const students = await this.studentRepo.find({
      where: {
        locationId: locationId,
      },
      order: { createdAt: 'DESC' },
    });

    // Filter by date range (created in this period)
    const studentsInRange = students.filter(
      (s) => new Date(s.createdAt) >= start && new Date(s.createdAt) <= end,
    );

    // Calculate summary
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.isActive).length;
    const inactiveStudents = students.filter((s) => !s.isActive).length;
    const newStudentsThisPeriod = studentsInRange.length;

    // Format details
    const details = students.map((student) => ({
      id: student.id,
      studentId: student.studentId,
      registrationId: student.registrationId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      isActive: student.isActive,
      createdAt: student.createdAt,
    }));

    return {
      filter,
      range: { start, end },
      summary: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        newStudentsThisPeriod,
      },
      details,
    };
  }

  // ============================================
  // 📊 STUDENT ATTENDANCE REPORT API
  // ============================================
  async getStudentAttendanceReport(query: any, user: any) {
    const { filter = 'today', fromDate, toDate,locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    // Get all active students
    const students = await this.studentRepo.find({
      where: {
        isActive: true,
        locationId: locationId,
      },
    });

    // Get attendance records in date range
    const attendanceRecords = await this.attendanceRepo.find({
      where: {
        locationId: locationId,
        createdAt: Between(start, end),
      },
    });

    // Calculate attendance per student
    const data = students.map((student) => {
      const studentAttendance = attendanceRecords.filter(
        (a) => a.studentId === student.studentId,
      );
      const classesAttended = studentAttendance.length;
      const lastAttendance =
        studentAttendance.length > 0
          ? new Date(
            Math.max(
              ...studentAttendance.map((a) =>
                new Date(a.createdAt).getTime(),
              ),
            ),
          )
          : null;

      // Calculate attendance percentage (assuming certain classes scheduled)
      const totalClasses = attendanceRecords.filter(
        (a) => a.date === new Date(student.createdAt).toISOString().split('T')[0],
      ).length;

      return {
        studentId: student.studentId,
        studentName: student.name,
        totalClasses: Math.max(classesAttended, 1),
        classesAttended,
        attendancePercentage: totalClasses > 0
          ? Math.round((classesAttended / totalClasses) * 100)
          : 0,
        lastAttendance,
      };
    });

    return {
      filter,
      range: { start, end },
      totalRecords: data.length,
      data,
    };
  }

  // ============================================
  // 👤 USER/STAFF/TRAINER REPORT API
  // ============================================
  async getUserReport(query: any) {
    const { filter = 'today', fromDate, toDate, locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    // Get all users
    const users = await this.userRepo.find({
      where: {
        locationId: locationId,
      },
      order: { createdAt: 'DESC' },
    });

    // Calculate summary
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === UserRole.ADMIN).length;
    const totalStaff = users.filter((u) => u.role === UserRole.STAFF).length;
    const totalTrainers = users.filter((u) => u.role === UserRole.TRAINER).length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const inactiveUsers = users.filter((u) => !u.isActive).length;

    // Format details
    const details = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      locationId: user.locationId || 'N/A',
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));

    return {
      filter,
      range: { start, end },
      summary: {
        totalUsers,
        totalAdmins,
        totalStaff,
        totalTrainers,
        activeUsers,
        inactiveUsers,
      },
      details,
    };
  }

  // ============================================
  // 🏆 TRAINER PERFORMANCE REPORT API
  // ============================================
  async getTrainerPerformanceReport(query: any) {
    const { filter = 'today', fromDate, toDate, locationId } = query;
    const { start, end } = this.getDateRange(filter, fromDate, toDate);

    // Get all trainers
    const trainers = await this.userRepo.find({
      where: {
        role: UserRole.TRAINER,
        isActive: true,
        locationId: locationId,
      },
    });

    // Calculate performance metrics for each trainer
    const data = await Promise.all(
      trainers.map(async (trainer) => {
        // Count classes held by trainer
        const classesHeld = await this.attendanceRepo.count({
          where: {
            trainerId: trainer.id,
            createdAt: Between(start, end),
            locationId: locationId,
          },
        });

        // Get last class date
        const lastClass = await this.attendanceRepo.findOne({
          where: {
            trainerId: trainer.id,
            createdAt: Between(start, end),
            locationId: locationId,
          },
          order: { createdAt: 'DESC' },
        });

        // Get unique students trained
        const studentSet = new Set(
          (
            await this.attendanceRepo
              .createQueryBuilder('attendance')
              .select('DISTINCT attendance.studentId')
              .where('attendance.trainerId = :trainerId', { trainerId: trainer.id })
              .andWhere('attendance.createdAt BETWEEN :start AND :end', {
                start,
                end,
              })
              .andWhere('attendance.locationId = :locationId', { locationId })
              .getRawMany()
          ).map((a) => a.attendance_studentId),
        );

        return {
          id: trainer.id,
          trainerName: trainer.name,
          email: trainer.email,
          classesHeld,
          totalStudentsAppraisal: studentSet.size,
          averageAttendance: classesHeld > 0 ? Math.round(classesHeld / studentSet.size || 0) : 0,
          lastClassDate: lastClass?.createdAt || null,
        };
      }),
    );

    return {
      filter,
      range: { start, end },
      totalTrainers: trainers.length,
      data: data.sort((a, b) => (b.classesHeld || 0) - (a.classesHeld || 0)),
    };
  }
}