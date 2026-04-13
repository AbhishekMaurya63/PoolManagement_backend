import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './schemas/payment.entity';
import { StudentsService } from '../students/students.service';
import { QR } from '../qr/entities/qr.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private repo: Repository<Payment>,
    @InjectRepository(QR)
    private qrRepo: Repository<QR>,
    private studentService: StudentsService,
  ) {}
  generateStudentId(): string {
    return 'STU-' + Date.now();
  }
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
    await this.studentService.activateStudent(dto.registrationId);
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
 async getStudentsAllPayments(registrationId: string) {
    return this.repo.find({
      where: { registrationId },
      relations: ['student', 'location'],
      order: { createdAt: 'DESC' },
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

  if (user.role !== 'admin') {
    qb.andWhere('payment.locationId = :locationId', {
      locationId: user.locationId,
    });
  } else if (locationId) {
    qb.andWhere('payment.locationId = :locationId', { locationId });
  }
  if (studentId) {
    qb.andWhere('payment.studentId = :studentId', { studentId });
  }
  if (paymentMode) {
    qb.andWhere('payment.paymentMode = :paymentMode', { paymentMode });
  }
  if (search) {
    qb.andWhere(
      `(student.name LIKE :search OR student.phone LIKE :search OR student.email LIKE :search OR student.registrationId LIKE :search OR student.userName LIKE :search)`,
      { search: `%${search}%` },
    );
  }
  if (isActive !== undefined) {
    qb.andWhere('payment.isActive = :isActive', {
      isActive: isActive === 'true',
    });
  }

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const toUTC = (date: Date) => {
    return new Date(date.getTime() - IST_OFFSET);
  };

  const now = new Date();

  let start: Date | null = null;
  let end: Date | null = null;

  if (user.role !== 'admin') {
  const s = new Date();
  s.setDate(s.getDate() - 7);
  s.setHours(0, 0, 0, 0);

  const e = new Date();
  e.setHours(23, 59, 59, 999);

  start = toUTC(s);
  end = toUTC(e);
}
if (user.role === 'admin') {
if (dateFilter === 'today') {
    const s = new Date();
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'week') {
    const s = new Date();
    s.setDate(s.getDate() - s.getDay()); // Sunday start
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'year') {
    const s = new Date(now.getFullYear(), 0, 1);
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  if (fromDate && toDate) {
    const s = new Date(fromDate);
    s.setHours(0, 0, 0, 0);

    const e = new Date(toDate);
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }
  if (start && end) {
    qb.andWhere('payment.createdAt BETWEEN :start AND :end', {
      start,
      end,
    });
  }
}
  const take = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * take;

  qb.skip(skip).take(take);
  qb.orderBy('payment.createdAt', 'DESC');
  const [data, total] = await qb.getManyAndCount();
  const formatToIST = (date: Date) => {
    const ist = new Date(date.getTime() + IST_OFFSET);

    const y = ist.getFullYear();
    const m = String(ist.getMonth() + 1).padStart(2, '0');
    const d = String(ist.getDate()).padStart(2, '0');

    const h = String(ist.getHours()).padStart(2, '0');
    const min = String(ist.getMinutes()).padStart(2, '0');
    const s = String(ist.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  };

  const formattedData = data.map((item) => ({
    ...item,
    createdAt: formatToIST(item.createdAt),
  }));

  return {
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    data: formattedData,
  };
}

async findMyPayments(user: string) {
 const existingStudent = await this.studentService.findById(user);

  if (!existingStudent) {
    throw new NotFoundException('Student not found');
  }
  const payments = await this.repo.find({
    where: { registrationId: existingStudent.registrationId },
    relations: ['student', 'location'],
    order: { createdAt: 'DESC' },
  });

  return payments;
}

async updateActivePayments(id:string,dto:any){
  const exist = await this.repo.findOne({where:{id}})
  if(!exist){
    throw new NotFoundException("Payment Not found")
  }
  if(!exist.isActive){
    throw new BadRequestException("Payment Expired")
  }
const validFromDate = new Date(exist.validFrom);

const validTill = new Date(validFromDate);
validTill.setDate(validTill.getDate() + dto.validityDays);
  exist.amount = dto.amount;
  exist.validTill=validTill;
  exist.screenshot=dto.screenshot
  exist.alternative=dto.alternative
  const updatedPayment = await this.repo.save(exist)
  const existQR = await this.qrRepo.findOne({where:{paymentId:exist.id}})
  if(existQR){
    existQR.expiry=validTill
    await this.qrRepo.save(existQR)
  }
  return updatedPayment
}
}