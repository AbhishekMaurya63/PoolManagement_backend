import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location, LocationDocument } from './schemas/location.schema';
import { Model } from 'mongoose';
import { CreateLocationDto,UpdateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

  async create(dto: CreateLocationDto) {
    return this.locationModel.create(dto);
  }

  async findAll(user:any) {
    if(user.role === 'admin'){
      return this.locationModel.find().sort({ createdAt: -1 });
    }
    return this.locationModel.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const location = await this.locationModel.findById(id);
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(id: string, dto: UpdateLocationDto) {
    const updated = await this.locationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }

  async toggleActive(id: string) {
    const location = await this.findById(id);
    location.isActive = !location.isActive;
    return location.save();
  }
}