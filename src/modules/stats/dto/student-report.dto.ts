export class StudentReportDto {
  id: string;
  studentId: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  dob: Date;
  isActive: boolean;
  createdAt: Date;
}

export class StudentSummaryDto {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  newStudentsThisPeriod: number;
}

export class StudentReportResponseDto {
  filter: string;
  range: {
    start: Date;
    end: Date;
  };
  summary: StudentSummaryDto;
  details: StudentReportDto[];
}

export class StudentAttendanceReportDto {
  studentId: string;
  studentName: string;
  totalClasses: number;
  classesAttended: number;
  attendancePercentage: number;
  lastAttendance: Date;
}

export class StudentAttendanceReportResponseDto {
  filter: string;
  range: {
    start: Date;
    end: Date;
  };
  totalRecords: number;
  data: StudentAttendanceReportDto[];
}
