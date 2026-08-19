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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
