import { Controller, Post, Param, Get, UseGuards, Query, Req } from '@nestjs/common';
import { QRService } from './qr.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '../users/entity/user.entity';
import { Roles } from 'src/common/decorators/role.decorater';

@Controller('qr')
@UseGuards(JwtAuthGuard,RolesGuard)
export class QRController {
  constructor(private service: QRService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(':paymentId')
  generate(@Param('paymentId') paymentId: string) {
    return this.service.generate(paymentId);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get('validate/:token')
  validate(@Param('token') token: string) {
    return this.service.validate(token);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('student/me')
  findById(@Req() req: any) {
    const studentId = req.user.studentId;
    return this.service.findById(studentId);
  }
}