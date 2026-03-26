import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('students')

export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('student-id/:studentId')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.service.findByStudentId(studentId);
  }

  @UseGuards(JwtAuthGuard) 
  @Get('registration-id/:registrationId')
  findByRegistrationId(@Param('registrationId') registrationId: string) {
    return this.service.findByRegistrationId(registrationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }
}