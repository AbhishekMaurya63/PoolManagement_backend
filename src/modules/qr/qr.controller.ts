import { Controller, Post, Param, Get, UseGuards, Query, Req } from '@nestjs/common';
import { QRService } from './qr.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QRController {
  constructor(private service: QRService) {}

  @Post(':paymentId')
  generate(@Param('paymentId') paymentId: string) {
    return this.service.generate(paymentId);
  }

  @Get('validate/:token')
  validate(@Param('token') token: string) {
    return this.service.validate(token);
  }

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