import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('staff')
  getStaffStats(@Query() query: any,@Req() req: any) {
    return this.service.getStaffStats(query,req.user);
  }
  @Get('trainer')
getTrainerStats(@Query() query: any, @Req() req: any) {
  return this.service.getTrainerStats(query, req.user);
}
}