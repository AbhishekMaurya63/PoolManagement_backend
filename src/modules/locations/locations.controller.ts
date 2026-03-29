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
import { UserRole } from '../users/dto/create-user.dto';


@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Req() req:any) {
    return this.service.findAll(req.user);
  }

  @Get('location/public')
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
   @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/toggle-active')
   @Roles(UserRole.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }
}