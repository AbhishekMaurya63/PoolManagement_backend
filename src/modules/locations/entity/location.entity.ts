import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid') // ✅ similar to Mongo _id
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  timing: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}