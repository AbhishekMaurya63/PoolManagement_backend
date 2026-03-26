import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../locations/entity/location.entity';

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    TRAINER = 'trainer',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Column({ select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STAFF,
    })
    role: UserRole;

    // 🔥 Relation (like ref in Mongo)
    @ManyToOne(() => Location, { nullable: true, eager: false })
    @JoinColumn({ name: 'locationId' })
    location: Location;

    @Column({ nullable: true })
    locationId: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}