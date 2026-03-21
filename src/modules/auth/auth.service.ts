import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  private usersService: UsersService,
  ) {}


  async login(dto: any) {
  const user = await this.usersService.findByEmail(dto.email);

  if (!user) throw new UnauthorizedException('User not found');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedException('Invalid password');

  const payload = {
    sub: user._id,
    role: user.role,
    locationId: user.locationId,
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
    },
  };
}
}