import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'POOLMANAGEMENTSECRETKEY',
      signOptions: { expiresIn: '7d' },
    }),
    UsersModule,
    StudentsModule,
    LocationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}