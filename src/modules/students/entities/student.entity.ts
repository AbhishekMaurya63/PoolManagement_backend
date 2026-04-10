import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Location } from '../../locations/entity/location.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentId: string;

  @Column({ unique: true })
  registrationId: string;

  @Column()
  name: string;

  @Column({unique: true, nullable: true})
  userName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  photo: string;

  @Column()
  aadhaarId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column()
  locationId: string;

  @Column()
dob: Date;

@Column({ select: false })
password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: true })
  termsAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}