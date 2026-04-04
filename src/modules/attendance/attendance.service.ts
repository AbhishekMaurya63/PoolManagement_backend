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
import { time } from 'console';

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

  const { fromTime, toTime } = query;

  const qb = this.repo
    .createQueryBuilder('attendance')
    .leftJoinAndSelect('attendance.student', 'student')
    .leftJoinAndSelect('attendance.trainer', 'trainer')
    .leftJoinAndSelect('attendance.location', 'location');

  // ✅ Role-based location filter
  if (user.role === 'admin') {
    if (query.locationId) {
      qb.andWhere('attendance.locationId = :locationId', {
        locationId: query.locationId,
      });
    }
  } else {
    qb.andWhere('attendance.locationId = :locationId', {
      locationId: user.locationId,
    });
  }

  // ✅ ALWAYS filter by full day (IST → UTC)
  let startUTC: string;
  let endUTC: string;

  if (fromTime && toTime) {
    // 👉 Use custom time range
    startUTC = this.convertISTToUTC(selectedDate, fromTime);
    endUTC = this.convertISTToUTC(selectedDate, toTime);
  } else {
    // 👉 Full day filter (12:00 AM → 11:59 PM IST)
    startUTC = this.convertISTToUTC(selectedDate, '12:00 AM');
    endUTC = this.convertISTToUTC(selectedDate, '11:59 PM');
  }

  qb.andWhere(
    'attendance.createdAt BETWEEN :startUTC AND :endUTC',
    { startUTC, endUTC }
  );

  qb.orderBy('attendance.createdAt', 'DESC');

  // 🧪 Debug (optional but recommended)
  console.log('SQL:', qb.getSql());
  console.log('PARAMS:', qb.getParameters());

  const data = await qb.getMany();

  // ✅ Convert UTC → IST for response
  const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));

  return {
    date: selectedDate,
    total: data.length,
    data: formattedData,
  };
}
private convertISTToUTC(date: string, time: string): string {
  if (!date || !time) {
    throw new Error('Invalid date or time');
  }

  // Example time: "1:30 PM"
  const [timePart, period] = time.split(' ');

  if (!timePart || !period) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let [hour, minute] = timePart.split(':').map(Number);

  if (isNaN(hour) || isNaN(minute)) {
    throw new Error(`Invalid time values: ${time}`);
  }

  // ✅ Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  // ✅ Create date in LOCAL (server assumed IST)
  const localDate = new Date(date);
  localDate.setHours(hour, minute, 0, 0);

  // ✅ Convert to UTC ISO
  return localDate.toISOString();
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

  const [data, count] = await this.repo.findAndCount({
    where: { studentId: existingStudent.studentId },
    relations: ['trainer'],
    order: { createdAt: 'DESC' },
  });

  // ✅ Convert UTC → IST and derive local date
  const formattedData = data.map((item) => {
    const istDateTime = formatToIST(item.createdAt); // already returns IST string

    return {
      ...item,
      createdAt: istDateTime, 
      date: istDateTime.split(' ')[0], 
    };
  });

  return {
    total: count,
    data: formattedData,
  };
}
  }