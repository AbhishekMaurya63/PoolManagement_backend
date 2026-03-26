import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../locations/entity/location.entity';
import { User } from './entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Location]), // ✅ IMPORTANT
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}