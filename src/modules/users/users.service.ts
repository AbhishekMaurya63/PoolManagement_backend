import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Location } from '../locations/entity/location.entity';
import { QueryFailedError } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
  ) { }



  async create(dto: any) {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (existing) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // validate location
      if (dto.locationId) {
        const location = await this.locationRepo.findOne({
          where: { id: dto.locationId },
        });
        if (!location) throw new NotFoundException('Location not found');
      }

      const user = this.userRepo.create({
        ...dto,
        password: hashedPassword,
      });

      return await this.userRepo.save(user);
    } catch (error) {
      // 🔥 handle DB duplicate error (important)
      if (
        error instanceof QueryFailedError &&
        (error as any).code === 'ER_DUP_ENTRY'
      ) {
        throw new BadRequestException('Email already exists');
      }

      throw error;
    }
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, role, isActive, locationId } = query;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.location', 'location')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'location.id',
        'location.name',
        'location.address',
        'location.city',
        'location.state',
      ])
      .orderBy('user.createdAt', 'DESC');

    if (role) qb.andWhere('user.role = :role', { role });
    if (isActive !== undefined)
      qb.andWhere('user.isActive = :isActive', { isActive });
    if (locationId)
      qb.andWhere('user.locationId = :locationId', { locationId });

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findById(id: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.location', 'location')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'location.id',
        'location.name',
        'location.address',
        'location.city',
        'location.state',
      ])
      .where('user.id = :id', { id })
      .getOne();

    if (!user) throw new NotFoundException('User not found');

    return user; // ✅ same as populate
  }

async update(id: string, dto: any) {
  try {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // 🔥 check email duplication (exclude current user)
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (existing) {
        throw new BadRequestException('Email already exists');
      }
    }

    // 🔐 hash password if provided
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // validate location
    if (dto.locationId) {
      const location = await this.locationRepo.findOne({
        where: { id: dto.locationId },
      });
      if (!location) throw new NotFoundException('Location not found');
    }

    Object.assign(user, dto);

    return await this.userRepo.save(user);
  } catch (error) {
    // 🔥 DB-level duplicate fallback
    if (
      error instanceof QueryFailedError &&
      (error as any).code === 'ER_DUP_ENTRY'
    ) {
      throw new BadRequestException('Email already exists');
    }

    throw error;
  }
}

async changePassword(id: string, dto: any) {
  const user = await this.userRepo.findOne({ where: { id } });
  if (!user) throw new NotFoundException('User not found'); 
  user.password = await bcrypt.hash(dto.newPassword, 10);
  return await this.userRepo.save(user);
}

  async toggleStatus(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = !user.isActive;

    return await this.userRepo.save(user);
  }

async findByEmail(email: string) {
  return this.userRepo
    .createQueryBuilder('user')
    .addSelect('user.password') // ✅ MUST ADD THIS
    .where('user.email = :email', { email })
    .getOne();
}
}