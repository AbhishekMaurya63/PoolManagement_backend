import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from '../users/entity/user.entity';
import { Roles } from 'src/common/decorators/role.decorater';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard,RolesGuard)
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post('scan')
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  scan(@Body('token') token: string, @Req() req: any) {
    return this.service.markAttendance(token, req.user);
  }
  @Get('daily')
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  getDailyAttendance(@Query() query: any,@Req() req: any) {
    return this.service.getDailyAttendance(query, req.user);
  }
  @Get('student/me')
  getMyAttendance(@Query() query: any,@Req() req: any) {
    return this.service.getMyAttendance(query, req.user);
  }
  @Get('studentId/:studentId')
  getStudentAttendance(@Param('studentId') studentId: string, @Req() req: any) {
    return this.service.getStudentAttendance(studentId, req.user);
  }
}