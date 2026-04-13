import {
    BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
  import * as bcrypt from 'bcrypt';
import { formatToIST } from 'src/common/utils/localTime';
import { UpdateStudentDto } from './dto/update-student';
//   import { zonedTimeToUtc } from 'date-fns-tz';
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
   const existing = await this.repo
  .createQueryBuilder('user')
  .where('user.userName = :userName', { userName: dto.userName })
  .orWhere('user.name = :name AND user.email = :email', {
    name: dto.name,
    email: dto.email,
  })
  .getOne();

if (existing) {
  if (existing.userName === dto.userName) {
    throw new BadRequestException('Username already exists');
  }

  if (existing.name === dto.name && existing.email === dto.email) {
    throw new BadRequestException(
      'User with same name and email already registered'
    );
  }
}

  const rawPassword = this.generatePassword(dto.name, dto.dob);

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const student = this.repo.create({
    ...dto,
    dob: dto.dob,
    password: hashedPassword,
    registrationId: this.generateRegistrationId(),
    studentId: this.generateStudentId(),
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

  if (user.role !== 'admin') {
    qb.andWhere('student.locationId = :locationId', {
      locationId: user.locationId,
    });
  } else if (locationId) {
    qb.andWhere('student.locationId = :locationId', { locationId });
  }

  if (user.role === 'trainer') {
    qb.andWhere('student.isActive = true');
  }
  if (search) {
    qb.andWhere(
      `(student.name LIKE :search OR student.phone LIKE :search OR student.email LIKE :search OR student.registrationId LIKE :search OR student.userName LIKE :search OR student.studentId LIKE :search)`,
      { search: `%${search}%` },
    );
  }
  if (isActive !== undefined) {
    qb.andWhere('student.isActive = :isActive', {
      isActive: isActive === 'true',
    });
  }
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const toUTC = (date: Date) => {
    return new Date(date.getTime() - IST_OFFSET);
  };

  const nowIST = new Date();

  let start: Date | null = null;
  let end: Date | null = null;

  if (dateFilter === 'today') {
    const s = new Date();
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'week') {
    const s = new Date(nowIST);
    s.setDate(s.getDate() - s.getDay()); // Sunday start
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'month') {
    const s = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1);
    s.setHours(0, 0, 0, 0);

    const e = new Date();
    e.setHours(23, 59, 59, 999);

    start = toUTC(s);
    end = toUTC(e);
  }

  else if (dateFilter === 'year') {
    const s = new Date(nowIST.getFullYear(), 0, 1);
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
    qb.andWhere('student.createdAt BETWEEN :start AND :end', {
      start,
      end,
    });
  }
  const take = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * take;

  qb.skip(skip).take(take);
  qb.orderBy('student.createdAt', 'DESC');

  const [data, total] = await qb.getManyAndCount();

  const formattedData = data.map((item) => ({
  ...item,
  createdAt: formatToIST(item.createdAt),
}));

  return {
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    data:formattedData,
  };
}

async findById(id: string) {
    const student = await this.repo.findOne({
      where: { id },
      relations: ['location'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }


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
 async activateStudent(registrationId: string) {
    return this.repo
      .createQueryBuilder()
      .update(Student)
      .set({ isActive: true })
      .where('registrationId = :registrationId', { registrationId })
      .execute();
  }

  async updateStudent(id: string, dto: UpdateStudentDto) {
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');
    Object.assign(student, dto);
    return this.repo.save(student);
  }

  async findByUserName(userName: string) {
    return this.repo.createQueryBuilder('student')
    .addSelect('student.password')
    .where('student.userName = :userName', { userName })
    .getOne();;
  }

  async deleteStudent(id: string) {
  const student = await this.repo.findOne({
    where: { id },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  try {
    // 2️⃣ Try delete
    await this.repo.delete(id);

    return {
      success: true,
      message: 'Student deleted successfully',
    };
  } catch (error) {
    // 3️⃣ Handle FK constraint error
    if (
      error.code === '23503' || // PostgreSQL foreign key violation
      error.code === 'ER_ROW_IS_REFERENCED_2' // MySQL
    ) {
      throw new BadRequestException(
        'Cannot delete student. It is linked with other data (payments, QR, etc).'
      );
    }

    throw error;
  }
}
}