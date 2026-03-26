import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entity/user.entity';
import { Location } from '../../locations/entity/location.entity';

@Entity()
export class Attendance {
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @Column()
  trainerId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column()
  locationId: string;

  @Column()
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}