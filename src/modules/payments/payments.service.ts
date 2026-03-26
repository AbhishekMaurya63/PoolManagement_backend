import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './schemas/payment.entity';
import { StudentsService } from '../students/students.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private repo: Repository<Payment>,
    private studentService: StudentsService,
  ) {}

  // 🔥 Create Payment
  async create(dto: any) {
    const student = await this.studentService.findByRegistrationId(dto.registrationId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // ❌ Prevent overlapping active plan
    const activePayment = await this.repo.findOne({
      where: { registrationId: dto.registrationId, isActive: true },
    });

    if (activePayment && new Date(activePayment.validTill) > new Date()) {
      throw new BadRequestException('Student already has active plan');
    }

    const now = new Date();

    const validTill = new Date();
    validTill.setDate(now.getDate() + dto.validityDays);

    const payment = this.repo.create({
      ...dto,
      locationId: student.locationId,
      validFrom: now,
      validTill,
    });
    await this.studentService.activateStudent(dto.registrationId, validTill);
    return this.repo.save(payment);
  }

  // 🔥 Check Active Payment
  async getActivePayment(registrationId: string) {
    return this.repo.findOne({
      where: {
        registrationId,
        isActive: true,
      },
      relations: ['student', 'location'],
    });
  }

  // 🔥 Validate Payment (Used in QR scan)
  async validatePayment(registrationId: string) {
    const payment = await this.getActivePayment(registrationId);

    if (!payment) {
      throw new BadRequestException('No active payment');
    }

    if (new Date() > new Date(payment.validTill)) {
      payment.isActive = false;
      await this.repo.save(payment);

      throw new BadRequestException('Payment expired');
    }

    return payment;
  }

async findAll(user: any, query: any) {
  const {
    search,
    locationId,
    studentId,
    paymentMode,
    isActive,
    page = 1,
    limit = 10,
    dateFilter,
    fromDate,
    toDate,
  } = query;

  const qb = this.repo
    .createQueryBuilder('payment')
    .leftJoinAndSelect('payment.student', 'student')
    .leftJoinAndSelect('payment.location', 'location');

  // 🔐 Role-based filtering
  if (user.role !== 'admin') {
    qb.andWhere('payment.locationId = :locationId', {
      locationId: user.locationId,
    });
  } else if (locationId) {
    qb.andWhere('payment.locationId = :locationId', { locationId });
  }

  // 👤 Student filter
  if (studentId) {
    qb.andWhere('payment.studentId = :studentId', { studentId });
  }

  // 💳 Payment mode filter
  if (paymentMode) {
    qb.andWhere('payment.paymentMode = :paymentMode', { paymentMode });
  }

  // 🔍 Search (student fields)
  if (search) {
    qb.andWhere(
      `(student.name LIKE :search OR student.phone LIKE :search)`,
      { search: `%${search}%` },
    );
  }

  // ✅ Active filter
  if (isActive !== undefined) {
    qb.andWhere('payment.isActive = :isActive', {
      isActive: isActive === 'true',
    });
  }

  // 📅 DATE FILTERS
  const now = new Date();

  if (dateFilter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    qb.andWhere('payment.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    qb.andWhere('payment.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();

    qb.andWhere('payment.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();

    qb.andWhere('payment.createdAt BETWEEN :start AND :end', { start, end });
  }

  // 🧠 Custom date range
  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    qb.andWhere('payment.createdAt BETWEEN :start AND :end', { start, end });
  }

  // 📄 Pagination
  const skip = (page - 1) * limit;

  qb.skip(skip).take(limit);

  qb.orderBy('payment.createdAt', 'DESC');

  const [data, total] = await qb.getManyAndCount();

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data,
  };
}
}