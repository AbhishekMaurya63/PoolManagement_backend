import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

// TEMP: replace with UsersService later
const fakeUsers = [
  {
    _id: '1',
    email: 'admin@test.com',
    password: '$2b$10$7QJ9xZkYH9vX1qjz7VnQ.e1n4g6T1vXk1', // hashed password
    role: 'admin',
    locationId: null,
    name: 'Admin',
  },
  {
    _id: '2',
    email: 'staff@test.com',
    password: '$2b$10$7QJ9xZkYH9vX1qjz7VnQ.e1n4g6T1vXk1', // hashed password
    role: 'staff',
    locationId: null,
    name: 'Staff',
  },
];

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {

    return this.authService.login(dto);
  }
}