import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from '../users/entity/user.entity';
import { Roles } from 'src/common/decorators/role.decorater';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('students')

export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TRAINER)
@Get()
findAll(@Req() req: any, @Query() query: any) {
  return this.service.findAll(req.user, query);
}
@UseGuards(JwtAuthGuard)
@Get('me')
findMyDetails(@Req() req: any) {
  console.log('Fetching details for user:', req.user);
  return this.service.findById(req.user.userId);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TRAINER)
  @Get('student-id/:studentId')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.service.findByStudentId(studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get('registration-id/:registrationId')
  findByRegistrationId(@Param('registrationId') registrationId: string) {
    return this.service.findByRegistrationId(registrationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }
}