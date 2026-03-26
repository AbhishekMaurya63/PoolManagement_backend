import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {

    return this.authService.login(dto);
  }
  @Post('student/login')
  async studentLogin(@Body() dto: LoginDto) {
    return this.authService.studentLogin(dto);
  }
}