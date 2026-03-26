import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private StudentsService: StudentsService
  ) {}

  async login(dto: any) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const payload = {
      sub: user.id, // ✅ FIXED
      role: user.role,
      locationId: user.locationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, // ✅ FIXED
        name: user.name,
        role: user.role,
        locationId: user.locationId,
      },
    };
  }

  async studentLogin(dto: any) {
    const user = await this.StudentsService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Student not found');
    if (!user.isActive) throw new UnauthorizedException('Student is not active');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const payload = {
      sub: user.id, 
      studentId: user.studentId, // ✅ now using SQL id
      role: 'student',
      locationId: user.locationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, 
        studentId: user.studentId,
        role: 'student',
        name: user.name,
        locationId: user.locationId,
      },
    };
  }
}