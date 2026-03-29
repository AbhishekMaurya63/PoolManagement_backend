import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entity/location.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto, UpdateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
  ) {}

  async create(dto: CreateLocationDto) {
    const location = this.locationRepo.create(dto);
    return await this.locationRepo.save(location);
  }

  async findAll(user: any) {
    if (user.role === 'admin') {
      return this.locationRepo.find({
        order: { createdAt: 'DESC' },
      });
    }

    return this.locationRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const location = await this.locationRepo.findOne({ where: { id } });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async findAllPublic() {
    return this.locationRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
  async update(id: string, dto: UpdateLocationDto) {
    const location = await this.findById(id);

    Object.assign(location, dto);

    return await this.locationRepo.save(location);
  }

  async toggleActive(id: string) {
    const location = await this.findById(id);

    location.isActive = !location.isActive;

    return await this.locationRepo.save(location);
  }
}