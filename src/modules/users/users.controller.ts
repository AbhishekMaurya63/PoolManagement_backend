import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserRole } from './dto/create-user.dto';

import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorater';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) { }

  // 👑 ADMIN ONLY
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }


  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Req() req: any) {
    return this.service.findAll(req.query);
  }


  // 👑 ADMIN ONLY
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // 👑 ADMIN ONLY
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  // 👑 ADMIN ONLY
  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Get('profile/me')
  getProfile(@Req() req: any) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('Invalid user token');
    }
    return this.service.findById(req.user.userId);
  }


}