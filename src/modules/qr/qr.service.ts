import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QR } from './entities/qr.entity';
import { randomBytes } from 'crypto';
import { Payment } from '../payments/schemas/payment.entity';
import { Student } from '../students/entities/student.entity';
import * as QRCode from 'qrcode';
import { ImageService } from '../upload/image.service';
@Injectable()
export class QRService {
    constructor(
        @InjectRepository(QR)
        private repo: Repository<QR>,
        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        private uploadService: ImageService,
    ) { }

    generateToken(): string {
        return randomBytes(16).toString('hex');
    }

    async generate(paymentId: string) {
        const existing = await this.repo.findOne({
            where: { paymentId, isActive: true },
        });
        if (existing) return existing;
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        const student = await this.studentRepo.findOne({
            where: { registrationId: payment.registrationId },
        });
        if (!student) throw new NotFoundException('Student not found');
        const token = this.generateToken();
        const qrData = JSON.stringify({ token });
        // ✅ Generate QR as buffer
        const qrBuffer = await QRCode.toBuffer(qrData);
        const fileName = `qr-${token}.png`;
         const uploadedUrl = await this.uploadService.uploadToHostinger(
    qrBuffer,
    fileName,
  );
        const qr = this.repo.create({
            studentId: student.studentId,
            paymentId: payment.id,
            token,
            expiry: payment.validTill,
            qrImageUrl: uploadedUrl.url,
        });

        return this.repo.save(qr);
    }

    async validate(token: string) {
        const qr = await this.repo.findOne({
            where: { token, isActive: true },
            relations: ['student', 'payment'],
        });

        if (!qr) throw new NotFoundException('Invalid QR');

        if (new Date() > new Date(qr.expiry)) {
            qr.isActive = false;
            await this.repo.save(qr);
            throw new NotFoundException('QR expired');
        }

        return qr;
    }

async findAll(query: any) {
  const {
    page = 1,
    limit = 10,
    studentId,
    paymentId,
    isActive,
    token,
    fromDate,
    toDate,
  } = query;

  const qb = this.repo
    .createQueryBuilder('qr')
    .leftJoinAndSelect('qr.student', 'student')
    .leftJoinAndSelect('qr.payment', 'payment');

  // ✅ Filters
  if (studentId) {
    qb.andWhere('qr.studentId = :studentId', { studentId });
  }

  if (paymentId) {
    qb.andWhere('qr.paymentId = :paymentId', { paymentId });
  }

  if (isActive !== undefined) {
    qb.andWhere('qr.isActive = :isActive', {
      isActive: isActive === 'true',
    });
  }

  if (token) {
    qb.andWhere('qr.token LIKE :token', {
      token: `%${token}%`,
    });
  }

  if (fromDate) {
    qb.andWhere('qr.createdAt >= :fromDate', { fromDate });
  }

  if (toDate) {
    qb.andWhere('qr.createdAt <= :toDate', { toDate });
  }

  // ✅ Pagination
  const skip = (Number(page) - 1) * Number(limit);

  qb.skip(skip).take(Number(limit));

  // ✅ Sorting (latest first)
  qb.orderBy('qr.createdAt', 'DESC');

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

    async findById(studentId: string) {
        const qr = await this.repo.findOne({
            where: { studentId },
            relations: ['student', 'payment'],
        });
        if (!qr) throw new NotFoundException('QR not found');
        return qr;
    }
}