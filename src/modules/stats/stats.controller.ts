import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorater';

@Controller('stats')
@UseGuards(JwtAuthGuard,RolesGuard)
export class StatsController {
  constructor(private readonly service: StatsService) {}
  
  @Roles('admin','staff')
  @Get('staff')
  getStaffStats(@Query() query: any,@Req() req: any) {
    return this.service.getStaffStats(query,req.user);
  }
  @Roles('admin','trainer')
  @Get('trainer')
getTrainerStats(@Query() query: any, @Req() req: any) {
  return this.service.getTrainerStats(query, req.user);
}

  @Roles('admin')
  @Get('admin')
getAdminStats(@Query() query: any, @Req() req: any) {
  return this.service.getAdminStats(query);
}
}