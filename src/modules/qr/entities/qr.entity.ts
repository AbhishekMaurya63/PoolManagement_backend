import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Payment } from '../../payments/schemas/payment.entity';

@Entity()
export class QR {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student)
 @JoinColumn({
  name: 'studentId',
  referencedColumnName: 'studentId',
})
  student: Student;

  @Column()
  studentId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  paymentId: string;

  @Column({ unique: true })
  token: string;

  @Column({ nullable: true })
qrImageUrl: string;

  @Column()
  expiry: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}