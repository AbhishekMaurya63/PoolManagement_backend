import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Location } from '../../locations/entity/location.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

@ManyToOne(() => Student)
@JoinColumn({
  name: 'registrationId',
  referencedColumnName: 'registrationId',
})
student: Student;

  @Column()
  registrationId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column()
  locationId: string;

  @Column('decimal')
  amount: number;

//   @Column({
//     enum: ['cash', 'upi', 'online'],
//   })
//   paymentMode: string;

 @Column()
  paymentMode: string;

  @Column({ nullable: true })
  screenshot: string;

  @Column()
  validityDays: number;

  @Column()
  validFrom: Date;

  @Column()
  validTill: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}