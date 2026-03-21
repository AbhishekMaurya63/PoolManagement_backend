import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(dto: any) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userModel.create({
      ...dto,
      password: hashedPassword,
    });
  }

  async findAll() {
    return this.userModel.find().select('-password');
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: any) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, dto, {
      new: true,
    }).select('-password');

    if (!updated) throw new NotFoundException('User not found');

    return updated;
  }

  async toggleStatus(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.isActive = !user.isActive;
    return user.save();
  }

  // 🔥 used by AUTH
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}