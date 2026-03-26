import { TypeOrmModule } from "@nestjs/typeorm";
import { Attendance } from "./entities/attendance.entity";
import { QRModule } from "../qr/qr.module";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), QRModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}