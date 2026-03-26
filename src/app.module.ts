import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ImagesModule } from './modules/upload/image.module';
import { LocationsModule } from './modules/locations/locations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './modules/students/students.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { QRModule } from './modules/qr/qr.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'srv2209.hstgr.io', // e.g. srv123.hostinger.com
  port: 3306,
  username: 'u988170382_squaSportPool',
  password: 'Typerandom@#321',
  database: 'u988170382_squaSportPool',
  autoLoadEntities: true,
  synchronize: true, // ⚠️ only for development
}),
    AuthModule,
    LocationsModule,
    UsersModule,
    ImagesModule,
    StudentsModule,
    PaymentsModule,
    QRModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
