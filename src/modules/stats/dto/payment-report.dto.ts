export class PaymentReportDto {
  id: string;
  studentName: string;
  registrationId: string;
  amount: number;
  paymentMode: string;
  validFrom: Date;
  validTill: Date;
  isActive: boolean;
  createdAt: Date;
}

export class PaymentSummaryDto {
  totalPayments: number;
  totalRevenue: number;
  averagePayment: number;
  paymentsByMode: {
    mode: string;
    count: number;
    amount: number;
  }[];
  activeMembers: number;
  expiredMembers: number;
}

export class PaymentReportResponseDto {
  filter: string;
  range: {
    start: Date;
    end: Date;
  };
  summary: PaymentSummaryDto;
  details: PaymentReportDto[];
}
