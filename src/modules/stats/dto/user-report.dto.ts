export class UserReportDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  locationId: string;
  isActive: boolean;
  createdAt: Date;
}

export class UserSummaryDto {
  totalUsers: number;
  totalAdmins: number;
  totalStaff: number;
  totalTrainers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export class TrainerPerformanceDto {
  id: string;
  trainerName: string;
  email: string;
  classesHeld: number;
  totalStudentsAppraisal?: number;
  averageAttendance?: number;
  lastClassDate: Date;
}

export class UserReportResponseDto {
  filter: string;
  range: {
    start: Date;
    end: Date;
  };
  summary: UserSummaryDto;
  details: UserReportDto[];
}

export class TrainerPerformanceResponseDto {
  filter: string;
  range: {
    start: Date;
    end: Date;
  };
  totalTrainers: number;
  data: TrainerPerformanceDto[];
}
