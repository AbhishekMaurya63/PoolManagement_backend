import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { QRService } from '../qr/qr.service';
import { formatToIST } from 'src/common/utils/localTime';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private repo: Repository<Attendance>,
    private qrService: QRService,
    private studentService: StudentsService,
  ) {}

  async markAttendance(token: string, user: any) {
    const qr = await this.qrService.validate(token);

    if (!qr || !qr.student) {
      throw new BadRequestException('Invalid QR code');
    }
    const today = new Date().toISOString().split('T')[0];

    // ❌ prevent duplicate
    const existing = await this.repo.findOne({
      where: {
        studentId: qr.studentId,
        date: today,
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance already marked');
    }

    const attendance = this.repo.create({
      studentId: qr.studentId,
      trainerId: user.userId,
      locationId: qr.student.locationId,
      date: today,
    });

    await this.repo.save(attendance);

    return {
      message: 'Attendance marked',
      student: qr.student,
    };
  }

  async getDailyAttendance(query: any, user: any) {
    const selectedDate =
    query.date || new Date().toISOString().split('T')[0];
    
    if(user.role === 'admin') {
      const data = await this.repo.find({
    where: { date: selectedDate, locationId: query.locationId },
    relations: ['student', 'trainer', 'location'],
    order: { createdAt: 'DESC' },
  });
  const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));
  return {
    date: selectedDate,
    total: data.length,
    data:formattedData,
  };// Admin can view attendance for all locations
    } else {
      const data = await this.repo.find({
    where: { date: selectedDate, locationId: user.locationId },
    relations: ['student', 'trainer', 'location'],
    order: { createdAt: 'DESC' },
  });
  const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));
  return {
    date: selectedDate,
    total: data.length,
    data:formattedData,
  };
    }

  
  }

  async getStudentAttendance(studentId: string, req: any) {
    if(req.user.role === 'admin') {
        const data = await this.repo.find({
      where: {
            studentId,
        locationId: req.query.locationId,
      },
      relations: ['student', 'trainer', 'location'],
      order: { createdAt: 'DESC' },
    });
    const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));
    return {
      total: data.length,
        data:formattedData,
    };
    }
    const data = await this.repo.find({
      where: {
            studentId,
        locationId: req.user.locationId,
      },
      relations: ['student', 'trainer', 'location'],
      order: { createdAt: 'DESC' },
    });
    const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));
    return {
      total: data.length,
        data:formattedData,
    };
  }

  async getMyAttendance(query: any, user: any) {
    const existingStudent = await this.studentService.findById(user.userId);

    if (!existingStudent) {
      throw new BadRequestException('Student not found for current user');
    }
    const { page = 1 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { studentId: existingStudent.studentId },
      relations: ['trainer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
    });

    return {
      page,
      total,
      data,
    };
}
  }