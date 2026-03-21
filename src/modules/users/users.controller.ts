import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto,UpdateUserDto } from './dto/create-user.dto';

import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorater';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // 👑 ADMIN ONLY
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  // 👑 ADMIN ONLY
  @Get()
  @Roles('admin')
  findAll() {
    return this.service.findAll();
  }

  // 👑 ADMIN ONLY
  @Get(':id')
  @Roles('admin')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // 👑 ADMIN ONLY
  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  // 👑 ADMIN ONLY
  @Patch(':id/toggle-status')
  @Roles('admin')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }
}