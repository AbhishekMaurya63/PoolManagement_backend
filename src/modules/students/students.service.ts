import {
    BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
  import * as bcrypt from 'bcrypt';
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private repo: Repository<Student>,
  ) {}

  generateStudentId(): string {
    return 'STU-' + Date.now();
  }

  generateRegistrationId(): string {
    return 'REG-' + Math.floor(100000 + Math.random() * 900000);
  }


generatePassword(name: string, dob: string): string {
  const firstName = name.split(' ')[0];
  const capitalized =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const year = new Date(dob).getFullYear();

  return `${capitalized}${year}`;
}
async create(dto: any) {
    const existing = await this.repo.findOne({
        where: { email: dto.email },
      });
  if (existing) {
    throw new BadRequestException('Student with this email already exists');
  }

  const rawPassword = this.generatePassword(dto.name, dto.dob);

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const student = this.repo.create({
    ...dto,
    dob: dto.dob,
    password: hashedPassword,
    studentId: this.generateStudentId(),
    registrationId: this.generateRegistrationId(),
  });

  const saved = await this.repo.save(student);

  return {
    ...saved,
    defaultPassword: rawPassword,
  };
}

  async findAll(user: any, query: any) {
  const {
    search,
    locationId,
    isActive,
    page = 1,
    limit = 10,
    dateFilter, // today | week | month | year
    fromDate,
    toDate,
  } = query;

  const qb = this.repo
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.location', 'location');

  // 🔐 Role-based filtering
  if (user.role !== 'admin') {
    qb.andWhere('student.locationId = :locationId', {
      locationId: user.locationId,
    });
  } else if (locationId) {
    // Admin can filter by any location
    qb.andWhere('student.locationId = :locationId', { locationId });
  }

  // 🔍 Search filter
  if (search) {
    qb.andWhere(
      `(student.name LIKE :search OR student.phone LIKE :search OR student.email LIKE :search)`,
      { search: `%${search}%` },
    );
  }

  // ✅ Active filter
  if (isActive !== undefined) {
    qb.andWhere('student.isActive = :isActive', {
      isActive: isActive === 'true',
    });
  }

  const now = new Date();

  if (dateFilter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    qb.andWhere('student.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // start of week
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    qb.andWhere('student.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();

    qb.andWhere('student.createdAt BETWEEN :start AND :end', { start, end });
  }

  else if (dateFilter === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();

    qb.andWhere('student.createdAt BETWEEN :start AND :end', { start, end });
  }

  // 🧠 CUSTOM DATE RANGE
  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    end.setHours(23, 59, 59, 999);

    qb.andWhere('student.createdAt BETWEEN :start AND :end', { start, end });
  }

  // 📄 Pagination
  const skip = (page - 1) * limit;

  qb.skip(skip).take(limit);

  qb.orderBy('student.createdAt', 'DESC');

  const [data, total] = await qb.getManyAndCount();

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data,
  };
}

// async findById(id: string) {
//     const student = await this.repo.findOne({
//       where: { id },
//       relations: ['location'],
//     });
//     if (!student) throw new NotFoundException('Student not found');
//     return student;
//   }


  async findByStudentId(studentId: string) {
    const student = await this.repo.findOne({
      where: { studentId },
      relations: ['location'],
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByRegistrationId(registrationId: string) {
    const student = await this.repo.findOne({
      where: { registrationId },
      relations: ['location'],
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async toggleStatus(id: string) {
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    student.isActive = !student.isActive;
    return this.repo.save(student);
  }
 async activateStudent(registrationId: string, validTill: Date) {
    return this.repo
      .createQueryBuilder()
      .update(Student)
      .set({ isActive: true })
      .where('registrationId = :registrationId', { registrationId })
      .execute();
  }


  async findByEmail(email: string) {
    return this.repo.createQueryBuilder('student')
    .addSelect('student.password')
    .where('student.email = :email', { email })
    .getOne();;
  }
}