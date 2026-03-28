import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorater';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Roles('admin', 'staff')
  @Get('staff')
  getStaffStats(@Query() query: any, @Req() req: any) {
    return this.service.getStaffStats(query, req.user);
  }

  @Roles('admin', 'trainer')
  @Get('trainer')
  getTrainerStats(@Query() query: any, @Req() req: any) {
    return this.service.getTrainerStats(query, req.user);
  }

  // ============================================
  // 💳 PAYMENT REPORT ENDPOINT
  // ============================================
  @Roles('admin')
  @Get('reports/payments')
  getPaymentReport(@Query() query: any, @Req() req: any) {
    return this.service.getPaymentReport(query, req.user);
  }

  // ============================================
  // 👥 STUDENT REPORT ENDPOINT
  // ============================================
  @Roles('admin', 'staff', 'trainer')
  @Get('reports/students')
  getStudentReport(@Query() query: any, @Req() req: any) {
    return this.service.getStudentReport(query, req.user);
  }

  // ============================================
  // 📊 STUDENT ATTENDANCE REPORT ENDPOINT
  // ============================================
  @Roles('admin', 'staff', 'trainer')
  @Get('reports/attendance')
  getStudentAttendanceReport(@Query() query: any, @Req() req: any) {
    return this.service.getStudentAttendanceReport(query, req.user);
  }

  // ============================================
  // 👤 USER/STAFF/TRAINER REPORT ENDPOINT
  // ============================================
  @Roles('admin')
  @Get('reports/users')
  getUserReport(@Query() query: any) {
    return this.service.getUserReport(query);
  }

  // ============================================
  // 🏆 TRAINER PERFORMANCE REPORT ENDPOINT
  // ============================================
  @Roles('admin', 'staff')
  @Get('reports/trainer-performance')
  getTrainerPerformanceReport(@Query() query: any) {
    return this.service.getTrainerPerformanceReport(query);
  }
}