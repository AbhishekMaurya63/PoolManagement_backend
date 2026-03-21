import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto,UpdateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorater';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Post()
   @Roles('admin')
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Req() req:any) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
   @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
   @Roles('admin')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }
}