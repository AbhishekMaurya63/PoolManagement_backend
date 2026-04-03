import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Location } from '../../locations/entity/location.entity';
import { FamilyMember } from './family.entity';

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

  @Column({ unique: true })
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
  
@Column({ default: false })
isFamilyPack: boolean;

@OneToMany(() => FamilyMember, (member) => member.student, {
  cascade: true,
})
familyMembers: FamilyMember[];

@Column({ select: false })
password: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}