import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type AuthProvider = 'email' | 'google' | 'facebook';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index('idx_user_email')
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', default: 'email' })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  aadhaarNumber?: string;

  @Column({ type: 'jsonb', nullable: true })
  verificationDetails?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
