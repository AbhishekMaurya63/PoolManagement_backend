import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorater';
import { UserRole } from '../users/entity/user.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  // 💰 Staff/Admin can add payment
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  // 🔍 Get active payment
  @Get('active/:registrationId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getActive(@Param('registrationId') registrationId: string) {
    return this.service.getActivePayment(registrationId);
  }

  @Get(':registrationId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getStudentsAllPayments(@Param('registrationId') registrationId: string) {
    return this.service.getStudentsAllPayments(registrationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Get()
findAll(@Req() req: any, @Query() query: any) {
  return this.service.findAll(req.user, query);
}
}