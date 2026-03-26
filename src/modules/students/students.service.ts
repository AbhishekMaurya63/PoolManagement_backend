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
  async findAll(user: any) {
    // 🔥 location-based filtering
    if (user.role === 'admin') {
      return this.repo.find({
        relations: ['location'],
      });
    }

    return this.repo.find({
      where: { locationId: user.locationId },
      relations: ['location'],
    });
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
}